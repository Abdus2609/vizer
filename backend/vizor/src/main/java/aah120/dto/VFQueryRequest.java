package aah120.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
public class VFQueryRequest {

    private final String visChoice;
    private final String table;

    @JsonCreator
    public VFQueryRequest(
            @JsonProperty("visChoice") String visChoice,
            @JsonProperty("table") String table) {
        this.visChoice = visChoice;
        this.table = table;
    }

    public String getVisChoice() {
        return visChoice;
    }

    public String getTable() {
        return table;
    }
}
