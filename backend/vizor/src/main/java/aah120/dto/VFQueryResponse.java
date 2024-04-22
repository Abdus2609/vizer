package aah120.dto;

import java.util.List;

public class VFQueryResponse {
    
    private final String pattern;
    private final List<List<String>> keys;
    private final List<List<String>> columns;

    public VFQueryResponse(String pattern, List<List<String>> keys, List<List<String>> columns) {
        this.pattern = pattern;
        this.keys = keys;
        this.columns = columns;
    }

    public String getPattern() {
        return pattern;
    }

    public List<List<String>> getKeys() {
        return keys;
    }

    public List<List<String>> getColumns() {
        return columns;
    }
}
