package aah120.dto;

public class Column {
    
    private final String name;
    private final String type;
    private final String tableName;
    private boolean isPrimaryKey;
    private boolean isForeignKey;

    public Column(String name, String type, String tableName) {
        this.name = name;
        this.type = type;
        this.tableName = tableName;
    }

    public String getName() {
        return name;
    }

    public String getType() {
        return type;
    }

    public String getTableName() {
        return tableName;
    }

    public boolean isPrimaryKey() {
        return isPrimaryKey;
    }

    public void setPrimaryKey(boolean isPrimaryKey) {
        this.isPrimaryKey = isPrimaryKey;
    }

    public boolean isForeignKey() {
        return isForeignKey;
    }

    public void setForeignKey(boolean isForeignKey) {
        this.isForeignKey = isForeignKey;
    }
}
