package aah120.dto;

public class ForeignKey {
    
    private final String parentTable;
    private final String parentColumn;
    private final String childTable;
    private final String childColumn;

    public ForeignKey(String parentTable, String parentColumn, String childTable, String childColumn) {
        this.parentTable = parentTable;
        this.parentColumn = parentColumn;
        this.childTable = childTable;
        this.childColumn = childColumn;
    }

    public String getParentTable() {
        return parentTable;
    }

    public String getParentColumn() {
        return parentColumn;
    }

    public String getChildTable() {
        return childTable;
    }

    public String getChildColumn() {
        return childColumn;
    }
}
