package aah120.dto;

import java.util.List;

public class VFResponse {
    
    private final String pattern;
    private final List<VisualisationOption> options;

    public VFResponse(String pattern, List<VisualisationOption> options) {
        this.pattern = pattern;
        this.options = options;
    }

    public String getPattern() {
        return pattern;
    }

    public List<VisualisationOption> getOptions() {
        return options;
    }
}
