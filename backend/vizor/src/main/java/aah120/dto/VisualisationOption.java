package aah120.dto;

import java.util.List;

public class VisualisationOption {
    
    private final String id;
    private final String name;
    private final String key1;
    private final String key2;
    private final List<String> attributes;
    private final String title;

    public VisualisationOption(String id, String name, String key1, String key2, List<String> attributes, String title) {
        this.id = id;
        this.name = name;
        this.key1 = key1;
        this.key2 = key2;
        this.attributes = attributes;
        this.title = title;
    }

    public String getId() {
        return id;
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

    public String getTitle() {
        return title;
    }
}
