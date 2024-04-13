package aah120.dto;

import java.util.List;
import java.util.Map;

public class QueryResponse {
    
    private final String pattern;
    private final List<VisualisationOption> visualisations;
    private final List<Map<String, Object>> data;

    public QueryResponse(String pattern, List<VisualisationOption> visualisations, List<Map<String, Object>> data) {
        this.pattern = pattern;
        this.visualisations = visualisations;
        this.data = data;
    }

    public String getPattern() {
        return pattern;
    }

    public List<VisualisationOption> getVisualisations() {
        return visualisations;
    }

    public List<Map<String, Object>> getData() {
        return data;
    }
}
