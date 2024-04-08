package aah120.api;

import java.sql.SQLException;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// import io.github.MigadaTang.ER;
// import io.github.MigadaTang.Entity;
// import io.github.MigadaTang.Relationship;
// import io.github.MigadaTang.RelationshipEdge;
// import io.github.MigadaTang.Schema;
// import io.github.MigadaTang.common.RDBMSType;
// import io.github.MigadaTang.exception.DBConnectionException;
// import io.github.MigadaTang.exception.ParseException;
// import io.github.MigadaTang.transform.Reverse;
// import java.io.IOException;
// import java.sql.SQLException;

import aah120.dto.DatabaseDetails;
import aah120.dto.QueryRequest;
import aah120.dto.TableMetadata;

import org.springframework.web.bind.annotation.GetMapping;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api")
public class DatabaseController {

	private final DatabaseService databaseService;

	public DatabaseController(DatabaseService service) {
		this.databaseService = service;
	}

	@PostMapping("database")
	public ResponseEntity<String> connectToDatabase(@RequestBody DatabaseDetails databaseDetails) {

		try {
			databaseService.setConnectionDetails(databaseDetails);
			return new ResponseEntity<>("{\"message\": \"Received database details successfully\"}", HttpStatus.OK);
		} catch (Exception e) {
			e.printStackTrace();
			return new ResponseEntity<>("{\"message\": \"Failed to connect to the database\"}", HttpStatus.INTERNAL_SERVER_ERROR);
		}

		// try {
		// connection = connectionManager.getConnection();

		// System.out.println("Connected to the database");

		// System.out.println(databaseDetails);

		// String query = "SELECT table_name FROM information_schema.tables WHERE
		// table_schema = 'public'";
		// NamedParameterJdbcTemplate namedParameterJdbcTemplate = new
		// NamedParameterJdbcTemplate(connectionManager.getDataSource());
		// MapSqlParameterSource parameters = new MapSqlParameterSource();
		// List<String> tableNames = namedParameterJdbcTemplate.queryForList(query,
		// parameters, String.class);

		// connection = connectionManager.getConnection();

		// DatabaseMetaData metaData = connection.getMetaData();
		// ResultSet tables = metaData.getTables(null, "public", "%", new
		// String[]{"TABLE"});

		// ER.initialize();
		// Reverse reverse = new Reverse();
		// Schema schema = reverse.relationSchemasToERModel(
		// RDBMSType.POSTGRESQL,
		// databaseDetails.getHost(),
		// databaseDetails.getPort(),
		// databaseDetails.getDatabaseName(),
		// databaseDetails.getUsername(),
		// databaseDetails.getPassword()
		// );

		// System.out.println("Entity List:");
		// List<Entity> entityList = schema.getEntityList();

		// for (Entity entity : entityList) {
		// System.out.println(entity.getName() + " " + entity.getEntityType());
		// }

		// System.out.println();
		// System.out.println();

		// System.out.println("Relationship List:");
		// List<Relationship> relationshipList = schema.getRelationshipList();

		// for (Relationship relationship : relationshipList) {
		// System.out.println(relationship.getName() + ":");
		// List<RelationshipEdge> relationshipEdges = relationship.getEdgeList();

		// for (RelationshipEdge edge: relationshipEdges) {
		// System.out.println(edge.getConnObjType());
		// System.out.println(edge.getCardinality());
		// }
		// }

		// String jsonResponse = "{\"message\": \"Received database details
		// successfully\"}";
		// return new ResponseEntity<>(jsonResponse, HttpStatus.OK);
		// } catch (SQLException e) {
		// e.printStackTrace();
		// return new ResponseEntity<>("Failed to connect to the database",
		// HttpStatus.INTERNAL_SERVER_ERROR);
		// } finally {
		// connectionManager.closeConnection(connection);
		// }
	}

	@GetMapping("tables")
	public ResponseEntity<List<TableMetadata>> getTables() {
		try {
			List<TableMetadata> tables = databaseService.getTableMetadata();
			return ResponseEntity.ok(tables);
		} catch (SQLException e) {
			e.printStackTrace();
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@PostMapping("query")
	public ResponseEntity<List<Map<String, Object>>> executeQuery(@RequestBody QueryRequest query) {
		try {
			List<Map<String, Object>> result = databaseService.executeQuery(query);
			return ResponseEntity.ok(result);
		} catch (SQLException e) {
			e.printStackTrace();
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	// // SQL sample
	// @RequestMapping("calc")
	// Result calc(@RequestParam int left, @RequestParam int right) {
	// MapSqlParameterSource source = new MapSqlParameterSource()
	// .addValue("left", left)
	// .addValue("right", right);
	// return jdbcTemplate.queryForObject("SELECT :left + :right AS answer", source,
	// (rs, rowNum) -> new Result(left, right, rs.getLong("answer")));
	// }
}
