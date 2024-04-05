package aah120.api;

import java.sql.Connection;
import java.sql.SQLException;

import org.apache.commons.dbcp2.BasicDataSource;

import org.springframework.stereotype.Component;

@Component
public class DatabaseConnectionManager {

	private BasicDataSource dataSource;

	public void setConnectionDetails(String host, String port, String databaseName, String username, String password) {
		String url = "jdbc:postgresql://" + host + ":" + port + "/" + databaseName;

		this.dataSource = new BasicDataSource();
		this.dataSource.setDriverClassName("org.postgresql.Driver");
		this.dataSource.setUrl(url);
		this.dataSource.setUsername(username);
		this.dataSource.setPassword(password);

		try {
			Connection connection = getConnection();
			closeConnection(connection);
		} catch (SQLException e) {
			e.printStackTrace();
		}
	}

	public Connection getConnection() throws SQLException {
		return dataSource.getConnection();
	}

	public void closeConnection(Connection connection) throws SQLException {
		if (connection != null && !connection.isClosed()) {
			connection.close();
		}
	}

}
