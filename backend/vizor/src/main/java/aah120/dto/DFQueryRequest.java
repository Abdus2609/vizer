package aah120.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class DFQueryRequest {

    private final List<String> tableNames;
    private final List<String> fullColumnNames;

    @JsonCreator
    public DFQueryRequest(
            @JsonProperty("tables") List<String> tableNames,
            @JsonProperty("columns") List<String> columnNames) {
        this.tableNames = tableNames;
        this.fullColumnNames = columnNames;
    }

    public List<String> getTableNames() {
        return tableNames;
    }

    public List<String> getFullColumnNames() {
        return fullColumnNames;
    }
}
