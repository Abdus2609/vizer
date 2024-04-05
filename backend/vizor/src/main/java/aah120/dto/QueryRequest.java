package aah120.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class QueryRequest {
    
    private final List<String> tableNames;
    private final List<String> columnNames;

    @JsonCreator
    public QueryRequest(
        @JsonProperty("tables") List<String> tableNames,
        @JsonProperty("columns") List<String> columnNames
    ) {
        this.tableNames = tableNames;
        this.columnNames = columnNames;
    }

    public List<String> getTableNames() {
        return tableNames;
    }

    public List<String> getColumnNames() {
        return columnNames;
    }

    @Override
    public String toString() {
        return "QueryRequest{" +
                "tableName='" + tableNames + '\'' +
                ", columnNames=" + columnNames +
                '}';
    }
}
