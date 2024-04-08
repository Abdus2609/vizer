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
import aah120.dto.TableMetadata;

@Service
public class DatabaseService {

    private final DatabaseConnectionManager connectionManager;

    public DatabaseService(DatabaseConnectionManager connectionManager) {
        this.connectionManager = connectionManager;
    }

    public void setConnectionDetails(DatabaseDetails databaseDetails) {
        connectionManager.setConnectionDetails(
                databaseDetails.getHost(),
                databaseDetails.getPort(),
                databaseDetails.getDatabaseName(),
                databaseDetails.getUsername(),
                databaseDetails.getPassword());
    }

    public List<TableMetadata> getTableMetadata() throws SQLException {

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
                    Column col = new Column(colName, colType);
                    
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

            return tables;
        } catch (SQLException e) {
            e.printStackTrace();
            throw e;
        }
    }

    public List<Map<String, Object>> executeQuery(QueryRequest query) throws SQLException {

        try (Connection connection = connectionManager.getConnection()) {

            String tableNames = String.join(", ", query.getTableNames());
            String columnNames = String.join(", ", query.getColumnNames());

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