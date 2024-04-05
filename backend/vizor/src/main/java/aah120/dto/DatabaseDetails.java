package aah120.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class DatabaseDetails {
    private String username;
    private String password;
    private String host;
    private String port;
    private String databaseName;

    @JsonCreator
    public DatabaseDetails(
            @JsonProperty("username") String username,
            @JsonProperty("password") String password,
            @JsonProperty("host") String host,
            @JsonProperty("port") String port,
            @JsonProperty("database") String databaseName) {
        this.username = username;
        this.password = password;
        this.host = host;
        this.port = port;
        this.databaseName = databaseName;
    }
}