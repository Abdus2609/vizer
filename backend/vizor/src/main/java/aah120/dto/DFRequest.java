package aah120.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class DFRequest {

    private final List<String> tableNames;
    private final List<String> fullColumnNames;
    private final String pattern;

    @JsonCreator
    public DFRequest(
            @JsonProperty("tables") List<String> tableNames,
            @JsonProperty("columns") List<String> columnNames,
            @JsonProperty("pattern") String pattern) {
        this.tableNames = tableNames;
        this.fullColumnNames = columnNames;
        this.pattern = pattern;
    }

    public List<String> getTableNames() {
        return tableNames;
    }

    public List<String> getFullColumnNames() {
        return fullColumnNames;
    }
}
