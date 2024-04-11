package aah120.dto;

import java.util.List;
import java.util.Map;

public class QueryResponse {
    
    private final String pattern;
    private final List<String> visualisations;
    private final List<Map<String, Object>> data;

    public QueryResponse(String pattern, List<String> visualisations, List<Map<String, Object>> data) {
        this.pattern = pattern;
        this.visualisations = visualisations;
        this.data = data;
    }

    public String getPattern() {
        return pattern;
    }

    public List<String> getVisualisations() {
        return visualisations;
    }

    public List<Map<String, Object>> getData() {
        return data;
    }
}
