package aah120.dto;

import java.util.List;

public class VisualisationOption {
    
    String name;
    String key1;
    String key2;
    List<String> attributes;

    public VisualisationOption(String name, String key1, String key2, List<String> attributes) {
        this.name = name;
        this.key1 = key1;
        this.key2 = key2;
        this.attributes = attributes;
    }

    public String getName() {
        return name;
    }

    public String getKey1() {
        return key1;
    }

    public String getKey2() {
        return key2;
    }

    public List<String> getAttributes() {
        return attributes;
    }
}
