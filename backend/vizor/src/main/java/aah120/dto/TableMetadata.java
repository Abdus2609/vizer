package aah120.dto;

import java.util.List;

public class TableMetadata {
    
    private final String tableName;
    private final List<String> columnNames;
    private final List<String> columnTypes;
    private final List<String> primaryKeys;
    private final List<String> foreignKeys;

    public TableMetadata(String tableName, List<String> columnNames, List<String> columnTypes, List<String> primaryKeys, List<String> foreignKeys) {
        this.tableName = tableName;
        this.columnNames = columnNames;
        this.columnTypes = columnTypes;
        this.primaryKeys = primaryKeys;
        this.foreignKeys = foreignKeys;
    }

    public String getTableName() {
        return tableName;
    }

    public List<String> getColumnNames() {
        return columnNames;
    }

    public List<String> getColumnTypes() {
        return columnTypes;
    }

    public List<String> getPrimaryKeys() {
        return primaryKeys;
    }

    public List<String> getForeignKeys() {
        return foreignKeys;
    }

    @Override
    public String toString() {
        return "TableMetadata{" +
                "tableName='" + tableName + '\'' +
                ", columnNames=" + columnNames +
                ", primaryKeys=" + primaryKeys +
                ", foreignKeys=" + foreignKeys +
                '}';
    }
}
