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

import aah120.dto.DatabaseDetails;
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
            ResultSet tables = metaData.getTables(null, "public", "%", new String[] { "TABLE" });
            List<TableMetadata> tablesAndColumnsList = new ArrayList<>();

            while (tables.next()) {
                String tableName = tables.getString("TABLE_NAME");
                ResultSet columns = metaData.getColumns(null, "public", tableName, "%");
                List<String> columnNames = new ArrayList<>();
                List<String> columnTypes = new ArrayList<>();
                while (columns.next()) {
                    columnNames.add(columns.getString("COLUMN_NAME"));
                    columnTypes.add(columns.getString("TYPE_NAME"));
                }

                ResultSet primaryKeys = metaData.getPrimaryKeys(null, "public", tableName);
                List<String> primaryKeyNames = new ArrayList<>();
                while (primaryKeys.next()) {
                    primaryKeyNames.add(primaryKeys.getString("COLUMN_NAME"));
                }

                ResultSet foreignKeys = metaData.getImportedKeys(null, "public", tableName);
                List<String> foreignKeyNames = new ArrayList<>();
                while (foreignKeys.next()) {
                    foreignKeyNames.add(foreignKeys.getString("FKCOLUMN_NAME"));
                }

                tablesAndColumnsList
                        .add(new TableMetadata(tableName, columnNames, columnTypes, primaryKeyNames, foreignKeyNames));
            }

            return tablesAndColumnsList;
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