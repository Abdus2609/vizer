package aah120.dto;

import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class DFRequest {

    private final List<String> tableNames;
    private final List<String> fullColumnNames;
    private final String pattern;
    private final Map<String, Map<String, String>> filters;
    private final int limit;

    @JsonCreator
    public DFRequest(
            @JsonProperty("tables") List<String> tableNames,
            @JsonProperty("columns") List<String> columnNames,
            @JsonProperty("pattern") String pattern,
            @JsonProperty("filters") Map<String, Map<String, String>> filters,
            @JsonProperty("limit") int limit) {
        this.tableNames = tableNames;
        this.fullColumnNames = columnNames;
        this.pattern = pattern;
        this.filters = filters;
        this.limit = limit;
    }

    public List<String> getTableNames() {
        return tableNames;
    }

    public List<String> getFullColumnNames() {
        return fullColumnNames;
    }

    public String getPattern() {
        return pattern;
    }

    public Map<String, Map<String, String>> getFilters() {
        return filters;
    }

    public int getLimit() {
        return limit;
    }
}
