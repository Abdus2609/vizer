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

import aah120.dto.DatabaseDetails;
import aah120.dto.DFRequest;
import aah120.dto.DFResponse;
import aah120.dto.TableMetadata;
import aah120.dto.VFRequest;
import aah120.dto.VFResponse;
import aah120.dto.VFVisSelectRequest;

import org.springframework.web.bind.annotation.GetMapping;

@RestController
@CrossOrigin(origins = "https://vizer-app.netlify.app")
@RequestMapping("/api/v1")
public class MainController {

	private final DatabaseService databaseService;

	public MainController(DatabaseService databaseService) {
		this.databaseService = databaseService;
	}

	@PostMapping("db-login")
	public ResponseEntity<String> connectToDatabase(@RequestBody DatabaseDetails databaseDetails) {

		try {
			databaseService.setConnectionDetails(databaseDetails);
			return ResponseEntity.ok("{\"message\": \"Received database details successfully\"}");
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.internalServerError().body("{\"message\": \"Failed to connect to the database\"}");
		}
	}

	@GetMapping("tables")
	public ResponseEntity<List<TableMetadata>> getTables() {
		try {
			List<TableMetadata> tables = databaseService.fetchTableMetadata();
			return ResponseEntity.ok(tables);
		} catch (SQLException e) {
			e.printStackTrace();
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@PostMapping("df-visualise")
	public ResponseEntity<DFResponse> getVisualisations(@RequestBody DFRequest request) throws SQLException {
		DFResponse response = databaseService.dfRecommendVisualisations(request);

		return ResponseEntity.ok(response);
	}

	@PostMapping("vf-generate")
	public ResponseEntity<VFResponse> getColumnOptions(@RequestBody VFRequest request) {
		VFResponse response = databaseService.vfGenerateOptions(request);

		return ResponseEntity.ok(response);
	}

	@PostMapping("vf-execute")
	public ResponseEntity<List<Map<String, Object>>> executeQuery(@RequestBody DFRequest request) {
		List<Map<String, Object>> response = databaseService.vfExecuteQuery(request);

		return ResponseEntity.ok(response);
	}

	@PostMapping("vf-select")
	public ResponseEntity<List<String>> selectVis(@RequestBody VFVisSelectRequest request) throws SQLException {
		List<String> response = databaseService.vfSelectVis(request);

		return ResponseEntity.ok(response);
	}
}
