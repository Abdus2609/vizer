package aah120.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
public class VFRequest {

    private final String visId;
    private final String table;

    @JsonCreator
    public VFRequest(
            @JsonProperty("visId") String visId,
            @JsonProperty("table") String table) {
        this.visId = visId;
        this.table = table;
    }

    public String getVisId() {
        return visId;
    }

    public String getTable() {
        return table;
    }
}
