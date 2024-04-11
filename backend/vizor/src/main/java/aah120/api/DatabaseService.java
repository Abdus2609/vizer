package aah120.api;

import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import aah120.dto.Column;
import aah120.dto.DatabaseDetails;
import aah120.dto.ForeignKey;
import aah120.dto.QueryRequest;
import aah120.dto.QueryResponse;
import aah120.dto.TableMetadata;

@Service
public class DatabaseService {

    private final DatabaseConnectionManager connectionManager;
    private final List<TableMetadata> databaseMetadata;

    public DatabaseService(DatabaseConnectionManager connectionManager) {
        this.connectionManager = connectionManager;
        this.databaseMetadata = new ArrayList<>();
    }

    public void setConnectionDetails(DatabaseDetails databaseDetails) {
        connectionManager.setConnectionDetails(
                databaseDetails.getHost(),
                databaseDetails.getPort(),
                databaseDetails.getDatabaseName(),
                databaseDetails.getUsername(),
                databaseDetails.getPassword());
    }

    public void setDatabaseMetadata(List<TableMetadata> tables) {
        this.databaseMetadata.clear();
        this.databaseMetadata.addAll(tables);
    }

    public List<TableMetadata> fetchTableMetadata() throws SQLException {

        try (Connection connection = connectionManager.getConnection()) {
            DatabaseMetaData metaData = connection.getMetaData();
            ResultSet tablesRs = metaData.getTables(null, "public", "%", new String[] { "TABLE" });
            List<TableMetadata> tables = new ArrayList<>();

            while (tablesRs.next()) {
                String tableName = tablesRs.getString("TABLE_NAME");

                ResultSet primaryKeysRs = metaData.getPrimaryKeys(null, "public", tableName);
                List<String> primaryKeys = new ArrayList<>();
                while (primaryKeysRs.next()) {
                    primaryKeys.add(primaryKeysRs.getString("COLUMN_NAME"));
                }

                ResultSet foreignKeysRs = metaData.getImportedKeys(null, "public", tableName);
                List<ForeignKey> foreignKeys = new ArrayList<>();
                while (foreignKeysRs.next()) {
                    String parentTable = foreignKeysRs.getString("PKTABLE_NAME");
                    String parentColumn = foreignKeysRs.getString("PKCOLUMN_NAME");
                    String childTable = foreignKeysRs.getString("FKTABLE_NAME");
                    String childColumn = foreignKeysRs.getString("FKCOLUMN_NAME");
                    foreignKeys.add(new ForeignKey(parentTable, parentColumn, childTable, childColumn));
                }

                ResultSet columnsRs = metaData.getColumns(null, "public", tableName, "%");
                List<Column> columns = new ArrayList<>();
                while (columnsRs.next()) {
                    String colName = columnsRs.getString("COLUMN_NAME");
                    String colType = columnsRs.getString("TYPE_NAME");
                    Column col = new Column(colName, colType, tableName);

                    if (primaryKeys.contains(colName)) {
                        col.setPrimaryKey(true);
                    }

                    if (foreignKeys.stream().anyMatch(fk -> fk.getChildColumn().equals(colName))) {
                        col.setForeignKey(true);
                    }

                    columns.add(col);
                }

                tables.add(new TableMetadata(tableName, columns, primaryKeys, foreignKeys));
            }

            setDatabaseMetadata(tables);
            return tables;
        } catch (SQLException e) {
            e.printStackTrace();
            throw e;
        }
    }

    public QueryResponse recommendVisualisations(QueryRequest request) {

        List<String> tableNames = request.getTableNames();
        List<String> fullColumnNames = request.getFullColumnNames();
        List<String> columnNames = fullColumnNames.stream().map(col -> col.split("\\.")[1]).toList();

        List<TableMetadata> tables = new ArrayList<>();
        List<Column> columns = new ArrayList<>();
        String pattern = null; // one of basic, weak, one-many, or many-many
        List<String> vizOptions = new ArrayList<>(); // one of graph choices

        for (TableMetadata table : databaseMetadata) {
            if (tableNames.contains(table.getTableName())) {
                tables.add(table);
                for (Column column : table.getColumns()) {
                    if (columnNames.contains(column.getName())) {
                        columns.add(column);
                    }
                }
            }
        }

        int numPks = (int) columns.stream().filter(Column::isPrimaryKey).count();
        int numFks = (int) columns.stream().filter(col -> col.isForeignKey() && !col.isPrimaryKey()).count();
        int numFkWithPk = (int) columns.stream().filter(col -> col.isForeignKey()).count();
        int numAtts = columns.size() - numPks - numFks;

        if (numAtts == 0) {
            pattern = "none";
        } else if (numPks == 0 && numFks == 0) {
            pattern = "none";
        } else if (isBasicEntity(numPks, numFks, numFkWithPk, tables, columns)) {
            pattern = "basic";
        } else if (isWeakEntity(numPks, numFks, numFkWithPk, tables, columns)) {
            pattern = "weak";
        } else if (isOneManyRelationship(numPks, numFks, numFkWithPk, tables, columns)) {
            pattern = "one-many";
        } else if (isManyManyRelationship(numPks, numFks, numFkWithPk, tables, columns)) {
            if (isReflexive(numPks, numFks, numFkWithPk, tables, columns)) {
                pattern = "reflexive";
            } else {
                pattern = "many-many";
            }
        } else {
            pattern = "none";
        }

        System.out.println(pattern);

        // build and execute query to get data

        return new QueryResponse(pattern, vizOptions, new ArrayList<>());
    }

    private boolean isBasicEntity(int numPks, int numFks, int numFkWithPk, List<TableMetadata> tables,
            List<Column> columns) {

        if (numPks > 1) {
            return false;
        }

        if (numFkWithPk == 0) {
            return true;
        }

        // assume only single table used - NEED TO UPDATE FOR MULTIPLE TABLES
        TableMetadata table = tables.get(0);

        boolean inheritedPk = table.getForeignKeys().stream().map(ForeignKey::getChildColumn).toList()
                .containsAll(table.getPrimaryKeys());

        if (inheritedPk || table.getPrimaryKeys().size() == 0) {
            return true;
        }

        return false;
    }

    private boolean isWeakEntity(int numPks, int numFks, int numFkWithPk, List<TableMetadata> tables,
            List<Column> columns) {

        // assume only single table used - NEED TO UPDATE FOR MULTIPLE TABLES
        TableMetadata table = tables.get(0);

        List<String> bothPkAndFk = columns.stream().filter(col -> col.isPrimaryKey() && col.isForeignKey())
                .map(Column::getName).toList();

        if (bothPkAndFk.size() == 0) {
            return false;
        }

        // the fks that are also pks NEED to be subset of total pks otherwise reflexive many-many
        if (bothPkAndFk.size() == table.getPrimaryKeys().size()) {
            return false;
        }

        List<ForeignKey> chosenPkFks = table.getForeignKeys().stream()
                .filter(fk -> bothPkAndFk.contains(fk.getChildColumn())).toList();

        // check they all have same parent (within single foreign key)
        if (chosenPkFks.stream().map(ForeignKey::getParentTable).distinct().count() == 1) {
            return true;
        }

        return false;
    }

    private boolean isOneManyRelationship(int numPks, int numFks, int numFkWithPk, List<TableMetadata> tables,
            List<Column> columns) {

        // assume only single table used - NEED TO UPDATE FOR MULTIPLE TABLES
        // TableMetadata table = tables.get(0);

        if (numFks == 0 || numPks == 0) {
            return false;
        }

        List<Column> chosenFks = columns.stream().filter(col -> col.isForeignKey() && col.isPrimaryKey()).toList();

        if (chosenFks.size() == 0) {
            return true;
        }

        return false;
    }

    private boolean isManyManyRelationship(int numPks, int numFks, int numFkWithPk, List<TableMetadata> tables,
            List<Column> columns) {

        if (numPks != 2) {
            return false;
        }

        // assume only single table used - NEED TO UPDATE FOR MULTIPLE TABLES
        TableMetadata table = tables.get(0);

        if (table.getPrimaryKeys().size() != 2) {
            return false;
        }

        if (!(table.getForeignKeys().stream().map(ForeignKey::getChildColumn).toList()
                .containsAll(table.getPrimaryKeys())
                && table.getPrimaryKeys()
                        .containsAll(table.getForeignKeys().stream().map(ForeignKey::getChildColumn).toList()))) {
            return false;
        }

        return true;
    }

    private boolean isReflexive(int numPks, int numFks, int numFkWithPk, List<TableMetadata> tables,
            List<Column> columns) {

        // assume only single table used - NEED TO UPDATE FOR MULTIPLE TABLES
        TableMetadata table = tables.get(0);

        return table.getForeignKeys().stream().map(ForeignKey::getParentTable).distinct().count() == 1;
    }

    public List<Map<String, Object>> executeQuery(QueryRequest query) throws SQLException {

        try (Connection connection = connectionManager.getConnection()) {

            String tableNames = String.join(", ", query.getTableNames());
            String columnNames = String.join(", ", query.getFullColumnNames());

            System.out.println("Received query request for table: " + tableNames + " and columns: " + columnNames);

            String queryStr = "SELECT " + columnNames + " FROM " + tableNames;

            System.out.println(queryStr);

            PreparedStatement preparedStatement = connection.prepareStatement(queryStr);
            ResultSet resultSet = preparedStatement.executeQuery();

            List<Map<String, Object>> results = new ArrayList<>();
            ResultSetMetaData metaData = resultSet.getMetaData();
            int columnCount = metaData.getColumnCount();

            while (resultSet.next()) {
                Map<String, Object> row = new LinkedHashMap<>();
                for (int i = 1; i <= columnCount; i++) {
                    row.put(metaData.getColumnName(i), resultSet.getObject(i));
                }

                results.add(row);
            }

            return results;
        } catch (SQLException e) {
            e.printStackTrace();
            throw e;
        }
    }
}