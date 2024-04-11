package aah120.dto;

import java.util.List;

public class VisualisationOption {
    
    String name;
    List<String> keys;
    List<String> attributes;

    public VisualisationOption(String name, List<String> keys, List<String> attributes) {
        this.name = name;
        this.keys = keys;
        this.attributes = attributes;
    }

    public String getName() {
        return name;
    }

    public List<String> getKeys() {
        return keys;
    }

    public List<String> getAttributes() {
        return attributes;
    }
}
