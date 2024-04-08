package aah120.dto;

import java.util.List;

public class TableMetadata {
    
    private final String tableName;
    private final List<Column> columns;
    private final List<String> primaryKeys;
    private final List<ForeignKey> foreignKeys;

    public TableMetadata(String tableName, List<Column> columns, List<String> primaryKeys, List<ForeignKey> foreignKeys) {
        this.tableName = tableName;
        this.columns = columns;
        this.primaryKeys = primaryKeys;
        this.foreignKeys = foreignKeys;
    }

    public String getTableName() {
        return tableName;
    }

    public List<Column> getColumns() {
        return columns;
    }

    public List<String> getPrimaryKeys() {
        return primaryKeys;
    }

    public List<ForeignKey> getForeignKeys() {
        return foreignKeys;
    }
}
