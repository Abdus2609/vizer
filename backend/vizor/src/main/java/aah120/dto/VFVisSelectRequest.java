package aah120.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
public class VFVisSelectRequest {

    private final String visId;

    @JsonCreator
    public VFVisSelectRequest(
            @JsonProperty("visId") String visId) {
        this.visId = visId;
    }

    public String getVisId() {
        return visId;
    }

}
