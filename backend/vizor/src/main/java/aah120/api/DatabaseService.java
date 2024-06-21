package aah120.api;

import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import org.springframework.stereotype.Service;

import aah120.dto.Column;
import aah120.dto.DatabaseDetails;
import aah120.dto.ForeignKey;
import aah120.dto.DFRequest;
import aah120.dto.DFResponse;
import aah120.dto.TableMetadata;
import aah120.dto.VFRequest;
import aah120.dto.VFResponse;
import aah120.dto.VFVisSelectRequest;
import aah120.dto.VisualisationOption;

@Service
public class DatabaseService {

  List<String> NUM_TYPES = List.of("numeric", "int2", "int4", "int8", "float4", "float8");
  List<String> TEMP_TYPES = List.of("date", "time", "timestamp");
  List<String> LEX_TYPES = List.of("varchar", "text", "char", "bpchar");
  List<String> GEO_TABLE_NAMES = List.of("country", "city", "state", "county", "province");
  List<String> GEO_COLUMN_NAMES = List.of("name", "code", "id");

  List<String> BASIC_VIS_TYPES = List.of("bar", "calendar", "scatter", "bubble", "choropleth", "word-cloud");
  List<String> WEAK_VIS_TYPES = List.of("line", "stacked-bar", "grouped-bar", "spider");
  List<String> ONE_MANY_VIS_TYPES = List.of("treemap", "hierarchy-tree", "circle-packing");
  List<String> MANY_MANY_VIS_TYPES = List.of("sankey", "network");
  List<String> REFLEXIVE_VIS_TYPES = List.of("chord");

  private final DatabaseConnectionManager connectionManager;
  private final List<TableMetadata> databaseMetadata;

  public DatabaseService(DatabaseConnectionManager connectionManager) {
    this.connectionManager = connectionManager;
    this.databaseMetadata = new ArrayList<>();
  }

  public void setConnectionDetails(DatabaseDetails databaseDetails) {
    connectionManager.setConnectionDetails(
        databaseDetails.getHost(),
        databaseDetails.getPort(),
        databaseDetails.getDatabaseName(),
        databaseDetails.getUsername(),
        databaseDetails.getPassword());
  }

  public void setDatabaseMetadata(List<TableMetadata> tables) {
    this.databaseMetadata.clear();
    this.databaseMetadata.addAll(tables);
  }

  public List<TableMetadata> fetchTableMetadata() throws SQLException {

    try (Connection connection = connectionManager.getConnection()) {
      DatabaseMetaData metaData = connection.getMetaData();
      ResultSet tablesRs = metaData.getTables(null, "public", "%", new String[] { "TABLE" });
      List<TableMetadata> tables = new ArrayList<>();

      while (tablesRs.next()) {
        String tableName = tablesRs.getString("TABLE_NAME");

        ResultSet primaryKeysRs = metaData.getPrimaryKeys(null, "public", tableName);
        List<String> primaryKeys = new ArrayList<>();
        while (primaryKeysRs.next()) {
          primaryKeys.add(primaryKeysRs.getString("COLUMN_NAME"));
        }

        ResultSet foreignKeysRs = metaData.getImportedKeys(null, "public", tableName);
        List<ForeignKey> foreignKeys = new ArrayList<>();
        while (foreignKeysRs.next()) {
          String parentTable = foreignKeysRs.getString("PKTABLE_NAME");
          String parentColumn = foreignKeysRs.getString("PKCOLUMN_NAME");
          String childTable = foreignKeysRs.getString("FKTABLE_NAME");
          String childColumn = foreignKeysRs.getString("FKCOLUMN_NAME");
          foreignKeys.add(new ForeignKey(parentTable, parentColumn, childTable, childColumn));
        }

        ResultSet columnsRs = metaData.getColumns(null, "public", tableName, "%");
        List<Column> columns = new ArrayList<>();
        while (columnsRs.next()) {
          String colName = columnsRs.getString("COLUMN_NAME");
          String colType = columnsRs.getString("TYPE_NAME");
          Column col = new Column(colName, colType, tableName);

          if (primaryKeys.contains(colName)) {
            col.setPrimaryKey(true);
          }

          if (foreignKeys.stream().anyMatch(fk -> fk.getChildColumn().equals(colName))) {
            col.setForeignKey(true);
          }

          columns.add(col);
        }

        tables.add(new TableMetadata(tableName, columns, primaryKeys, foreignKeys));
      }

      setDatabaseMetadata(tables);
      return tables;
    } catch (SQLException e) {
      e.printStackTrace();
      throw e;
    }
  }

  public DFResponse dfRecommendVisualisations(DFRequest request) throws SQLException {

    List<String> tableNames = request.getTableNames();
    List<String> fullColumnNames = request.getFullColumnNames();
    List<String> columnNames = fullColumnNames.stream().map(col -> col.split("\\.")[1]).toList();
    Map<String, Map<String, String>> filters = request.getFilters();
    int limit = request.getLimit();

    List<TableMetadata> tables = new ArrayList<>();
    List<Column> columns = new ArrayList<>();
    String pattern = null; // one of basic, weak, one-many, or many-many
    List<VisualisationOption> visOptions = new ArrayList<>(); // one of graph choices

    for (TableMetadata table : databaseMetadata) {
      if (tableNames.contains(table.getTableName())) {
        tables.add(table);
      }
    }

    // currently only supporting single-table queries
    TableMetadata table = tables.get(0);
    columns.addAll(table.getColumns().stream().filter(col -> col.isPrimaryKey()).toList());
    columns.addAll(table.getColumns().stream()
        .filter(col -> !columns.contains(col) && columnNames.contains(col.getName())).toList());

    int numPks = (int) columns.stream().filter(Column::isPrimaryKey).count();
    int numPureFks = (int) columns.stream().filter(col -> col.isForeignKey() && !col.isPrimaryKey()).count();
    int totalFks = (int) columns.stream().filter(col -> col.isForeignKey()).count();
    int numAtts = columns.size() - numPks - numPureFks;

    List<Column> chosenPks = columns.stream().filter(Column::isPrimaryKey).toList();
    List<Column> chosenFks = columns.stream().filter(col -> col.isForeignKey()).toList();
    List<Column> chosenAtts = columns.stream().filter(col -> !chosenPks.contains(col) && !chosenFks.contains(col))
        .toList();

    List<String> chosenPkNames = chosenPks.stream().map(Column::getName).toList();
    List<String> chosenFkNames = chosenFks.stream().map(Column::getName).toList();
    List<String> chosenAttNames = chosenAtts.stream().map(Column::getName).toList();

    List<String> chosenAttTypes = chosenAtts.stream().map(Column::getType).toList();

    if (numPks == 0 && numPureFks == 0) {
      pattern = "none";
    } else if (isBasicEntity(numPks, totalFks, tables, columns)) {
      pattern = "basic";

      Column key = numPks == 0 ? chosenFks.get(0) : chosenPks.get(0);
      String keyName = numPks == 0 ? String.join(" | ", chosenFkNames) : chosenPkNames.get(0);

      if (bar(chosenAttTypes)) {
        visOptions.add(new VisualisationOption("bar", "Bar Chart", keyName, "", chosenAttNames, ""));
      }
      if (calendar(chosenAttTypes)) {
        visOptions.add(new VisualisationOption("calendar", "Calendar", keyName, "", chosenAttNames, ""));
      }
      if (scatter(chosenAttTypes)) {
        visOptions.add(new VisualisationOption("scatter", "Scatter Chart", keyName, "", chosenAttNames, ""));
      }
      if (bubble(chosenAttTypes)) {
        visOptions.add(new VisualisationOption("bubble", "Bubble Chart", keyName, "", chosenAttNames, ""));
      }
      if (choropleth(key, chosenAttTypes)) {
        visOptions.add(new VisualisationOption("choropleth", "Choropleth Map", keyName, "", chosenAttNames, ""));
      }
      if (wordCloud(key, chosenAttTypes)) {
        visOptions.add(new VisualisationOption("word-cloud", "Word Cloud", keyName, "", chosenAttNames, ""));
      }
    } else if (isWeakEntity(tables, columns)) {
      pattern = "weak";

      String key1 = String.join(" | ", chosenFkNames);

      String key2 = "";

      Optional<String> key2Opt = chosenPks.stream().filter(pk -> !pk.isForeignKey()).map(Column::getName).findFirst();

      if (key2Opt.isPresent()) {
        key2 = key2Opt.get();
      }

      boolean completeWeak = isCompleteWeak(chosenPkNames, chosenFkNames, tableNames);

      if (line(chosenPks, chosenAttTypes)) {
        visOptions.add(new VisualisationOption("line", "Line Chart", key1, key2, chosenAttNames, ""));
      }
      if (completeWeak && stackedBar(chosenAttTypes)) {
        visOptions.add(new VisualisationOption("stacked-bar", "Stacked Bar Chart", key1, key2, chosenAttNames, ""));
      }
      if (groupedBar(chosenAttTypes)) {
        visOptions.add(new VisualisationOption("grouped-bar", "Grouped Bar Chart", key1, key2, chosenAttNames, ""));
      }
      if (completeWeak && spider(chosenAttTypes)) {
        visOptions.add(new VisualisationOption("spider", "Spider Chart", key1, key2, chosenAttNames, ""));
      }
    } else if (isOneManyRelationship(numPks, numPureFks, tables, columns)) {
      pattern = "one-many";

      String key1 = String.join(" | ", chosenFkNames.stream().filter(fk -> !chosenPkNames.contains(fk)).toList());
      String key2 = chosenPkNames.get(0);

      if (treemap(chosenAttTypes)) {
        visOptions.add(new VisualisationOption("treemap", "Treemap", key1, key2, chosenAttNames, ""));
      }
      if (hierarchyTree(chosenAttTypes)) {
        visOptions.add(new VisualisationOption("hierarchy-tree", "Hierarchy Tree", key1, key2, chosenAttNames, ""));
      }
      if (circlePacking(chosenAttTypes)) {
        visOptions.add(new VisualisationOption("circle-packing", "Circle Packing", key1, key2, chosenAttNames, ""));
      }
    } else if (isManyManyRelationship(numPks, tables)) {
      if (isReflexive(tables)) {
        pattern = "reflexive";

        if (chord(chosenAttTypes)) {
          visOptions.add(new VisualisationOption("chord", "Chord Diagram", chosenPkNames.get(0), chosenPkNames.get(1),
              chosenAttNames, ""));
        }
      } else {
        pattern = "many-many";

        if (sankey(chosenAttTypes)) {
          visOptions.add(new VisualisationOption("sankey", "Sankey Diagram", chosenPkNames.get(0), chosenPkNames.get(1),
              chosenAttNames, ""));
        }

        if (network(chosenAttTypes)) {
          visOptions.add(new VisualisationOption("network", "Network Chart", chosenPkNames.get(0), chosenPkNames.get(1),
              chosenAttNames, ""));
        }
      }
    } else {
      pattern = "none";
    }

    // build and execute query to get data
    List<Map<String, Object>> data = new ArrayList<>();

    try (Connection connection = connectionManager.getConnection()) {

      String queryStr = "";

      List<String> colNames = columns.stream().map(Column::getName).toList();

      if (pattern.equals("basic")) {
        queryStr = generateBasicQuery(tableNames, colNames, numPks, chosenPkNames, chosenFkNames,
            chosenAttNames, filters, limit);
      } else if (pattern.equals("weak")) {
        queryStr = generateWeakQuery(tableNames, colNames, chosenPkNames, chosenFkNames, chosenAttNames, filters,
            limit);
      } else if (pattern.equals("one-many")) {
        queryStr = generateOneManyQuery(tableNames, colNames, chosenPkNames, chosenFkNames, chosenAttNames, filters,
            limit);
      } else {
        queryStr = generateRegularQuery(tableNames, colNames, filters, limit);
      }

      System.out.println(queryStr);

      PreparedStatement preparedStatement = connection.prepareStatement(queryStr);
      ResultSet resultSet = preparedStatement.executeQuery();

      ResultSetMetaData metaData = resultSet.getMetaData();
      int columnCount = metaData.getColumnCount();

      while (resultSet.next()) {
        Map<String, Object> row = new LinkedHashMap<>();
        for (int i = 1; i <= columnCount; i++) {
          row.put(metaData.getColumnName(i), resultSet.getObject(i));
        }

        data.add(row);
      }

    } catch (SQLException e) {
      e.printStackTrace();
      throw e;
    }

    return new DFResponse(pattern, visOptions, data);
  }

  private String generateRegularQuery(List<String> tableNames, List<String> columnNames,
      Map<String, Map<String, String>> filters, int limit) {

    System.out.println("Generating regular query");

    StringBuilder sb = new StringBuilder();

    sb.append("SELECT ");

    for (int i = 0; i < columnNames.size(); i++) {
      sb.append(columnNames.get(i));
      if (i == columnNames.size() - 1) {
        sb.append(" ");
      } else {
        sb.append(", ");
      }
    }

    sb.append("FROM ");
    sb.append(String.join(", ", tableNames));

    sb.append(" WHERE ");
    sb.append(String.join(" AND ", columnNames.stream().map(c -> c + " IS NOT NULL").toList()));

    if (filters != null) {
      for (Map.Entry<String, Map<String, String>> entry : filters.entrySet()) {
        String columnName = entry.getKey();
        String type = entry.getValue().get("type");
        String comp = entry.getValue().get("comparator");
        String val = entry.getValue().get("value");

        if (type.equals("num")) {
          sb.append(" AND ").append(columnName).append(" ").append(comp).append(" ").append(val);
        } else if (type.equals("lex")) {
          if (comp.equals("=")) {
            sb.append(" AND ").append(columnName).append(" ILIKE '").append(val).append("'");
          } else if (comp.equals("!=")) {
            sb.append(" AND ").append(columnName).append(" NOT ILIKE '").append(val).append("'");
          } else {
            sb.append(" AND ").append(columnName).append(" ").append(comp).append(" '").append(val).append("'");
          }
        }
      }
    }

    if (limit != -1) {
      sb.append(" LIMIT ").append(limit);
    }

    sb.append(";");

    return sb.toString();
  }

  private String generateBasicQuery(List<String> tableNames, List<String> columnNames, int numPks,
      List<String> chosenPkNames, List<String> chosenFkNames, List<String> chosenAttNames,
      Map<String, Map<String, String>> filters, int limit) {

    System.out.println("Generating basic query");

    StringBuilder sb = new StringBuilder();

    sb.append("SELECT ");

    if (numPks == 0) {
      sb.append(String.join(" || ' | ' || ", chosenFkNames)).append(" AS ").append("\"")
          .append(String.join(" | ", chosenFkNames)).append("\"");

      if (chosenAttNames.size() > 0) {
        sb.append(", ").append(
            String.join(", ", chosenAttNames.stream().map(att -> "SUM(" + att + ")" + " AS " + att).toList()));
      }
    } else {
      sb.append(String.join(", ", chosenPkNames));

      if (chosenAttNames.size() > 0) {
        sb.append(", ").append(String.join(", ", chosenAttNames));
      }
    }

    sb.append(" FROM ");
    sb.append(String.join(", ", tableNames));

    sb.append(" WHERE ");
    sb.append(String.join(" AND ", columnNames.stream().map(c -> c + " IS NOT NULL").toList()));

    if (filters != null) {
      for (Map.Entry<String, Map<String, String>> entry : filters.entrySet()) {
        String columnName = entry.getKey();
        String type = entry.getValue().get("type");
        String comp = entry.getValue().get("comparator");
        String val = entry.getValue().get("value");

        if (type.equals("num")) {
          sb.append(" AND ").append(columnName).append(" ").append(comp).append(" ").append(val);
        } else if (type.equals("lex")) {
          if (comp.equals("=")) {
            sb.append(" AND ").append(columnName).append(" ILIKE '").append(val).append("'");
          } else if (comp.equals("!=")) {
            sb.append(" AND ").append(columnName).append(" NOT ILIKE '").append(val).append("'");
          } else {
            sb.append(" AND ").append(columnName).append(" ").append(comp).append(" '").append(val).append("'");
          }
        }
      }
    }

    if (numPks == 0) {
      sb.append(" GROUP BY ").append(String.join(", ", chosenFkNames));
      sb.append(" ORDER BY ").append(String.join(", ", chosenFkNames));
    }

    if (limit != -1) {
      sb.append(" LIMIT ").append(limit);
    }

    sb.append(";");

    return sb.toString();
  }

  private String generateWeakQuery(List<String> tableNames, List<String> columnNames, List<String> chosenPkNames,
      List<String> chosenFkNames, List<String> chosenAttNames, Map<String, Map<String, String>> filters, int limit) {

    System.out.println("Generating weak query");

    StringBuilder sb = new StringBuilder();

    sb.append("SELECT ");
    sb.append(String.join(" || ' | ' || ", chosenFkNames)).append(" AS ").append("\"")
        .append(String.join(" | ", chosenFkNames)).append("\"");

    List<String> chosenPurePks = chosenPkNames.stream().filter(pk -> !chosenFkNames.contains(pk)).toList();
    if (chosenPurePks.size() > 0) {
      sb.append(", ")
          .append(String.join(", ", chosenPurePks));
    }

    if (chosenAttNames.size() > 0) {
      sb.append(", ").append(
          String.join(", ", chosenAttNames.stream().map(att -> "SUM(" + att + ")" + " AS " + att).toList()));
    }

    sb.append(" FROM ");
    sb.append(String.join(", ", tableNames));

    sb.append(" WHERE ");
    sb.append(String.join(" AND ", columnNames.stream().map(c -> c + " IS NOT NULL").toList()));

    if (filters != null) {
      for (Map.Entry<String, Map<String, String>> entry : filters.entrySet()) {
        String columnName = entry.getKey();
        String type = entry.getValue().get("type");
        String comp = entry.getValue().get("comparator");
        String val = entry.getValue().get("value");

        if (type.equals("num")) {
          sb.append(" AND ").append(columnName).append(" ").append(comp).append(" ").append(val);
        } else if (type.equals("lex")) {
          if (comp.equals("=")) {
            sb.append(" AND ").append(columnName).append(" ILIKE '").append(val).append("'");
          } else if (comp.equals("!=")) {
            sb.append(" AND ").append(columnName).append(" NOT ILIKE '").append(val).append("'");
          } else {
            sb.append(" AND ").append(columnName).append(" ").append(comp).append(" '").append(val).append("'");
          }
        }
      }
    }

    sb.append(" GROUP BY ")
        .append(String.join(", ", chosenPkNames.stream().filter(pk -> !chosenFkNames.contains(pk)).toList()));

    if (chosenFkNames.size() > 0) {
      sb.append(", ").append(String.join(", ", chosenFkNames));
    }

    sb.append(" ORDER BY ")
        .append(String.join(", ", chosenPkNames.stream().filter(pk -> !chosenFkNames.contains(pk)).toList()));

    if (chosenFkNames.size() > 0) {
      sb.append(", ").append(String.join(", ", chosenFkNames));
    }

    if (limit != -1) {
      sb.append(" LIMIT ").append(limit);
    }

    sb.append(";");

    return sb.toString();
  }

  private String generateOneManyQuery(List<String> tableNames, List<String> columnNames, List<String> chosenPkNames,
      List<String> chosenFkNames, List<String> chosenAttNames, Map<String, Map<String, String>> filters, int limit) {

    System.out.println("Generating one-many query");

    StringBuilder sb = new StringBuilder();

    List<String> chosenPureFks = chosenFkNames.stream().filter(fk -> !chosenPkNames.contains(fk)).toList();

    sb.append("SELECT ");

    if (chosenPureFks.size() > 0) {
      sb.append(String.join(" || ' | ' || ", chosenPureFks)).append(" AS ")
          .append("\"").append(String.join(" | ", chosenPureFks)).append("\"");
    }

    if (chosenPkNames.size() > 0) {
      sb.append(", ").append(String.join(", ", chosenPkNames));
    }

    if (chosenAttNames.size() > 0) {
      sb.append(", ").append(
          String.join(", ", chosenAttNames.stream().map(att -> att + " AS " + att).toList()));
    }

    sb.append(" FROM ");
    sb.append(String.join(", ", tableNames));

    sb.append(" WHERE ");
    sb.append(String.join(" AND ", columnNames.stream().map(c -> c + " IS NOT NULL").toList()));

    if (filters != null) {
      for (Map.Entry<String, Map<String, String>> entry : filters.entrySet()) {
        String columnName = entry.getKey();
        String type = entry.getValue().get("type");
        String comp = entry.getValue().get("comparator");
        String val = entry.getValue().get("value");

        if (type.equals("num")) {
          sb.append(" AND ").append(columnName).append(" ").append(comp).append(" ").append(val);
        } else if (type.equals("lex")) {
          if (comp.equals("=")) {
            sb.append(" AND ").append(columnName).append(" ILIKE '").append(val).append("'");
          } else if (comp.equals("!=")) {
            sb.append(" AND ").append(columnName).append(" NOT ILIKE '").append(val).append("'");
          } else {
            sb.append(" AND ").append(columnName).append(" ").append(comp).append(" '").append(val).append("'");
          }
        }
      }
    }

    if (limit != -1) {
      sb.append(" LIMIT ").append(limit);
    }

    sb.append(";");

    return sb.toString();
  }

  private boolean isScalarType(String type) {
    return NUM_TYPES.contains(type) || TEMP_TYPES.contains(type);
  }

  private boolean bar(List<String> attTypes) {
    return attTypes.size() == 1 && isScalarType(attTypes.get(0));
  }

  private boolean calendar(List<String> attTypes) {
    return attTypes.size() == 1 && TEMP_TYPES.contains(attTypes.get(0));
  }

  private boolean wordCloud(Column key, List<String> attTypes) {
    return attTypes.size() == 1 && LEX_TYPES.contains(key.getType())
        && isScalarType(attTypes.get(0));
  }

  private boolean scatter(List<String> attTypes) {
    return attTypes.size() == 2 && attTypes.stream().allMatch(this::isScalarType);
  }

  private boolean bubble(List<String> attTypes) {
    return attTypes.size() == 3 && attTypes.stream().allMatch(this::isScalarType);
  }

  private boolean choropleth(Column key, List<String> attTypes) {
    boolean geographicalKey = GEO_TABLE_NAMES.contains(key.getName())
        || (GEO_TABLE_NAMES.contains(key.getTableName()) && GEO_COLUMN_NAMES.contains(key.getName()));

    return geographicalKey && attTypes.size() == 1;
  }

  private boolean line(List<Column> keys, List<String> attTypes) {
    if (attTypes.size() != 1) {
      return false;
    }

    List<Column> k2 = keys.stream().filter(k -> !k.isForeignKey()).toList();

    if (k2.stream().anyMatch(k -> !isScalarType(k.getType()))) {
      return false;
    }

    return attTypes.stream().allMatch(this::isScalarType);
  }

  private boolean stackedBar(List<String> attTypes) {
    return attTypes.size() == 1 && isScalarType(attTypes.get(0));
  }

  private boolean groupedBar(List<String> attTypes) {
    return attTypes.size() == 1 && isScalarType(attTypes.get(0));
  }

  private boolean spider(List<String> attTypes) {
    return attTypes.size() == 1 && isScalarType(attTypes.get(0));
  }

  private boolean treemap(List<String> attTypes) {
    return attTypes.size() == 1 && isScalarType(attTypes.get(0));
  }

  private boolean hierarchyTree(List<String> attTypes) {
    return attTypes.size() >= 0;
  }

  private boolean circlePacking(List<String> attTypes) {
    return attTypes.size() == 1 && isScalarType(attTypes.get(0));
  }

  private boolean sankey(List<String> attTypes) {
    return attTypes.size() == 1 && isScalarType(attTypes.get(0));
  }

  private boolean chord(List<String> attTypes) {
    return attTypes.size() == 1 && isScalarType(attTypes.get(0));
  }

  private boolean network(List<String> attTypes) {
    return attTypes.size() >= 0;
  }

  private boolean isBasicEntity(int numPks, int totalFks, List<TableMetadata> tables, List<Column> columns) {

    TableMetadata table = tables.get(0);

    List<String> pkFks = table.getColumns().stream().filter(col -> col.isPrimaryKey() && col.isForeignKey())
        .map(Column::getName).toList();

    // primary key inherited
    if (pkFks.size() == 1 && pkFks.containsAll(table.getPrimaryKeys()) || table.getPrimaryKeys().size() == 0) {
      return true;
    }

    if (totalFks == 0) {
      return true;
    }

    return false;
  }

  private boolean isWeakEntity(List<TableMetadata> tables, List<Column> columns) {

    // assume only single table used - NEED TO UPDATE FOR MULTIPLE TABLES
    TableMetadata table = tables.get(0);

    List<Column> bothPkAndFk = table.getColumns().stream().filter(col -> col.isPrimaryKey() && col.isForeignKey())
        .toList();

    if (bothPkAndFk.size() == 0) {
      return false;
    }

    for (Column pkFk : bothPkAndFk) {
      if (!columns.contains(pkFk)) {
        columns.add(pkFk);
      }
    }

    // parent pks NEED to be subset of all pks else reflexive many-many
    if (bothPkAndFk.size() == table.getPrimaryKeys().size()) {
      return false;
    }

    List<String> bothPkAndFkNames = bothPkAndFk.stream().map(Column::getName).toList();

    List<ForeignKey> chosenPkFks = table.getForeignKeys().stream()
        .filter(fk -> bothPkAndFkNames.contains(fk.getChildColumn())).toList();

    // check they all have same parent (within single foreign key)
    if (chosenPkFks.stream().map(ForeignKey::getParentTable).distinct().count() == 1) {
      return true;
    }

    return false;
  }

  private boolean isOneManyRelationship(int numPks, int numPureFks, List<TableMetadata> tables,
      List<Column> columns) {

    // assume only single table used - NEED TO UPDATE FOR MULTIPLE TABLES
    TableMetadata table = tables.get(0);

    if (numPureFks == 0 || numPks == 0) {
      return false;
    }

    List<String> chosenPureFks = columns.stream().filter(col -> col.isForeignKey() && !col.isPrimaryKey())
        .map(Column::getName).toList();
    List<ForeignKey> chosenFkObjs = table.getForeignKeys().stream()
        .filter(fk -> chosenPureFks.contains(fk.getChildColumn())).toList();

    if (chosenFkObjs.size() != chosenPureFks.size()) {
      return false;
    }

    if (chosenFkObjs.stream().map(ForeignKey::getParentTable).distinct().count() != 1) {
      return false;
    }

    return true;
  }

  private boolean isManyManyRelationship(int numPks, List<TableMetadata> tables) {

    if (numPks != 2) {
      return false;
    }

    // assume only single table used - NEED TO UPDATE FOR MULTIPLE TABLES
    TableMetadata table = tables.get(0);

    if (table.getPrimaryKeys().size() != 2) {
      return false;
    }

    if (!(table.getForeignKeys().stream().map(ForeignKey::getChildColumn).toList()
        .containsAll(table.getPrimaryKeys())
        && table.getPrimaryKeys()
            .containsAll(table.getForeignKeys().stream().map(ForeignKey::getChildColumn).toList()))) {
      return false;
    }

    return true;
  }

  private boolean isReflexive(List<TableMetadata> tables) {

    // assume only single table used - NEED TO UPDATE FOR MULTIPLE TABLES
    TableMetadata table = tables.get(0);

    return table.getForeignKeys().stream().map(ForeignKey::getParentTable).distinct().count() == 1;
  }

  private boolean isCompleteWeak(List<String> chosenPkNames, List<String> chosenFkNames, List<String> tableNames)
      throws SQLException {

    StringBuilder sb = new StringBuilder();

    sb.append("SELECT ");
    sb.append(String.join(" || ' | ' || ", chosenFkNames)).append(" AS ").append("\"")
        .append(String.join(" | ", chosenFkNames)).append("\"");
    List<String> chosenPurePks = chosenPkNames.stream().filter(pk -> !chosenFkNames.contains(pk)).toList();
    if (chosenPurePks.size() > 0) {
      sb.append(", ")
          .append(String.join(", ", chosenPurePks));
    }

    sb.append(" FROM ");
    sb.append(String.join(", ", tableNames));

    sb.append(";");

    String queryStr = sb.toString();

    Map<String, Set<String>> fks = new HashMap<>();

    try (Connection connection = connectionManager.getConnection()) {

      System.out.println(queryStr);

      PreparedStatement preparedStatement = connection.prepareStatement(queryStr);
      ResultSet resultSet = preparedStatement.executeQuery();

      if (!resultSet.next()) {
        return false;
      }

      while (resultSet.next()) {
        String fk = resultSet.getString(1);

        if (!fks.containsKey(fk)) {
          fks.put(fk, new HashSet<>());
        }

        fks.get(fk).add(resultSet.getString(2));
      }

    } catch (SQLException e) {
      e.printStackTrace();
      throw e;
    }

    List<String> allFks = fks.keySet().stream().toList();

    int count = fks.get(allFks.get(0)).size();

    for (String fk : allFks) {
      if (fks.get(fk).size() != count) {
        return false;
      }
    }

    return true;
  }

  public VFResponse vfGenerateOptions(VFRequest request) {

    List<VisualisationOption> options = new ArrayList<>();

    String vis = request.getVisId();
    String tableName = request.getTable();

    TableMetadata table = databaseMetadata.stream().filter(t -> t.getTableName().equals(tableName)).findFirst()
        .get();
    List<Column> columns = table.getColumns();

    List<Column> pks = columns.stream().filter(Column::isPrimaryKey).toList();
    List<Column> fks = columns.stream().filter(col -> col.isForeignKey()).toList();
    List<Column> atts = columns.stream().filter(col -> !col.isPrimaryKey() && !col.isForeignKey()).toList();

    String pattern = "none";

    if (BASIC_VIS_TYPES.contains(vis)) {
      pattern = "basic";

      String keyName = "";

      if (pks.size() == 0) {
        keyName = String.join(" | ", fks.stream().map(Column::getName).toList());
      } else {
        keyName = pks.get(0).getName();
      }

      switch (vis) {
        case "bar":
          for (Column att : atts) {
            if (isScalarType(att.getType())) {
              String title = keyName + " vs " + att.getName();
              options.add(new VisualisationOption("bar", "Bar Chart", keyName, "", List.of(att.getName()),
                  title));
            }
          }
          break;
        case "calendar":
          for (Column att : atts) {
            if (TEMP_TYPES.contains(att.getType())) {
              String title = keyName + " by " + att.getName();
              options.add(new VisualisationOption("calendar", "Calendar", keyName, "",
                  List.of(att.getName()), title));
            }
          }
          break;
        case "scatter":
          for (int i = 0; i < atts.size(); i++) {
            for (int j = 0; j < atts.size(); j++) {
              if (isScalarType(atts.get(i).getType()) && isScalarType(atts.get(j).getType()) && i != j) {
                String title = atts.get(i).getName() + " vs " + atts.get(j).getName();
                options.add(new VisualisationOption("scatter", "Scatter Chart", keyName, "",
                    List.of(atts.get(i).getName(), atts.get(j).getName()), title));
              }
            }
          }
          break;
        case "bubble":
          for (int i = 0; i < atts.size(); i++) {
            for (int j = 0; j < atts.size(); j++) {
              for (int k = 0; k < atts.size(); k++) {
                if (isScalarType(atts.get(i).getType()) && isScalarType(atts.get(j).getType())
                    && isScalarType(atts.get(k).getType()) && i != j && j != k && i != k) {
                  String title = atts.get(i).getName() + " vs " + atts.get(j).getName() + ", sized by "
                      + atts.get(k).getName();
                  options.add(new VisualisationOption("bubble", "Bubble Chart", keyName, "",
                      List.of(atts.get(i).getName(), atts.get(j).getName(),
                          atts.get(k).getName()),
                      title));
                }

              }
            }
          }
          break;
        case "choropleth":
          for (Column att : atts) {
            String title = att.getName();
            options.add(new VisualisationOption("choropleth", "Choropleth Map", keyName, "",
                List.of(att.getName()), title));
          }
          break;
        case "word-cloud":
          for (Column att : atts) {
            if (isScalarType(att.getType())) {
              String title = pks.get(0).getName() + ", sized by " + att.getName();
              options.add(new VisualisationOption("word-cloud", "Word Cloud", keyName, "",
                  List.of(att.getName()), title));
            }
          }
          break;
      }

    } else if (WEAK_VIS_TYPES.contains(vis)) {
      pattern = "weak";

      String concattedFkPkName = String.join(" | ", fks.stream().map(Column::getName).toList());

      List<Column> purePks = pks.stream().filter(pk -> !pk.isForeignKey()).toList();

      switch (vis) {
        case "line":
          for (Column pk : purePks) {
            if (isScalarType(pk.getType())) {
              for (Column att : atts) {
                if (isScalarType(att.getType())) {
                  String title = pk.getName() + " vs " + att.getName() + ", for each " + concattedFkPkName;
                  options.add(new VisualisationOption("line", "Line Chart", concattedFkPkName, pk.getName(),
                      List.of(att.getName()), title));
                }
              }
            }
          }
          break;
        case "stacked-bar":
          for (Column att : atts) {
            if (isScalarType(att.getType())) {
              String title = purePks.get(0).getName() + " vs " + att.getName() + ", for each " + concattedFkPkName;
              options.add(
                  new VisualisationOption("stacked-bar", "Stacked Bar Chart", concattedFkPkName,
                      purePks.get(0).getName(),
                      List.of(att.getName()), title));
            }
          }
          break;
        case "grouped-bar":
          for (Column att : atts) {
            if (isScalarType(att.getType())) {
              String title = purePks.get(0).getName() + " vs " + att.getName()
                  + ", for each " + concattedFkPkName;
              options.add(
                  new VisualisationOption("grouped-bar", "Grouped Bar Chart", concattedFkPkName,
                      purePks.get(0).getName(),
                      List.of(att.getName()), title));
            }
          }
          break;
        case "spider":
          for (Column att : atts) {
            if (isScalarType(att.getType())) {
              String title = purePks.get(0).getName() + " vs " + att.getName() + ", for each " + concattedFkPkName;
              options.add(new VisualisationOption("spider", "Spider Chart", concattedFkPkName, purePks.get(0).getName(),
                  List.of(att.getName()), title));
            }
          }
          break;
      }

    } else if (ONE_MANY_VIS_TYPES.contains(vis)) {
      pattern = "one-many";

      List<String> pureFks = fks.stream().filter(fk -> !pks.contains(fk)).map(Column::getName).toList();
      List<String> parentTables = table.getForeignKeys().stream().filter(fk -> pureFks.contains(fk.getChildColumn()))
          .map(ForeignKey::getParentTable).distinct()
          .toList();

      List<String> concattedFkNames = new ArrayList<>();

      for (String parentTable : parentTables) {
        List<String> children = table.getForeignKeys().stream()
            .filter(
                fk -> !table.getPrimaryKeys().contains(fk.getChildColumn()) && fk.getParentTable().equals(parentTable))
            .map(ForeignKey::getChildColumn).toList();
        String concattedFkName = String.join(" | ", children);
        concattedFkNames.add(concattedFkName);
      }

      switch (vis) {
        case "hierarchy-tree":
          for (String fkName : concattedFkNames) {
            String title = pks.get(0).getName() + ", for each " + fkName;
            options.add(new VisualisationOption("hierarchy-tree", "Hierarchy Tree", fkName, pks.get(0).getName(),
                List.of(), title));
          }
          break;
        case "treemap":
          for (String fkName : concattedFkNames) {
            for (Column att : atts) {
              if (isScalarType(att.getType())) {
                String title = pks.get(0).getName() + " vs " + att.getName() + ", for each " + fkName;
                options.add(new VisualisationOption("treemap", "Treemap", fkName, pks.get(0).getName(),
                    List.of(att.getName()), title));
              }
            }
          }
          break;
        case "circle-packing":
          for (String fkName : concattedFkNames) {
            for (Column att : atts) {
              if (isScalarType(att.getType())) {
                String title = pks.get(0).getName() + " vs " + att.getName() + ", for each " + fkName;
                options.add(new VisualisationOption("circle-packing", "Circle Packing", fkName, pks.get(0).getName(),
                    List.of(att.getName()), title));
              }
            }
          }
          break;
      }
    } else if (MANY_MANY_VIS_TYPES.contains(vis)) {
      pattern = "many-many";

      switch (vis) {
        case "sankey":
          String title = pks.get(0).getName() + " to " + pks.get(1).getName() + ", sized by "
              + atts.get(0).getName();
          for (Column att : atts) {
            if (isScalarType(att.getType())) {
              options.add(new VisualisationOption("sankey", "Sankey Diagram", pks.get(0).getName(),
                  pks.get(1).getName(), List.of(att.getName()), title));
            }
          }
          break;
      }

    } else if (REFLEXIVE_VIS_TYPES.contains(vis)) {
      pattern = "reflexive";

      switch (vis) {
        case "chord":
          String title = pks.get(0).getName() + " to " + pks.get(1).getName() + ", sized by " + atts.get(0).getName();
          for (Column att : atts) {
            if (isScalarType(att.getType())) {
              options.add(new VisualisationOption("chord", "Chord Diagram", pks.get(0).getName(), pks.get(1).getName(),
                  List.of(att.getName()), title));
            }
          }
          break;
      }
    }

    return new VFResponse(pattern, options);
  }

  public List<Map<String, Object>> vfExecuteQuery(DFRequest request) {

    List<Map<String, Object>> data = new ArrayList<>();

    String pattern = request.getPattern();
    List<String> tableNames = request.getTableNames();
    List<String> columnNames = request.getFullColumnNames();

    Map<String, Map<String, String>> filters = new HashMap<>();
    if (request.getFilters() != null) {
      filters = request.getFilters();
    }

    int limit = request.getLimit();

    if (limit == 0) {
      limit = -1;
    }

    List<TableMetadata> tables = new ArrayList<>();
    List<Column> columns = new ArrayList<>();

    for (TableMetadata table : databaseMetadata) {
      if (tableNames.contains(table.getTableName())) {
        tables.add(table);
        for (Column column : table.getColumns()) {
          if (columnNames.contains(column.getName())) {
            columns.add(column);
          }
        }
      }
    }

    int numPks = (int) columns.stream().filter(Column::isPrimaryKey).count();

    List<String> chosenPkNames = columns.stream().filter(Column::isPrimaryKey).map(Column::getName).toList();
    List<String> chosenFkNames = columns.stream().filter(Column::isForeignKey).map(Column::getName).toList();
    List<String> chosenAttNames = columns.stream().map(Column::getName)
        .filter(col -> !chosenPkNames.contains(col) && !chosenFkNames.contains(col)).toList();

    try (Connection connection = connectionManager.getConnection()) {

      String queryStr = "";

      if (pattern.equals("basic")) {
        queryStr = generateBasicQuery(tableNames, columnNames, numPks, chosenPkNames, chosenFkNames,
            chosenAttNames, filters, limit);
      } else if (pattern.equals("weak")) {
        queryStr = generateWeakQuery(tableNames, columnNames, chosenPkNames, chosenFkNames, chosenAttNames, filters,
            limit);
      } else if (pattern.equals("one-many")) {
        queryStr = generateOneManyQuery(tableNames, columnNames, chosenPkNames, chosenFkNames, chosenAttNames, filters,
            limit);
      } else {
        queryStr = generateRegularQuery(tableNames, columnNames, filters, limit);
      }

      System.out.println(queryStr);

      PreparedStatement preparedStatement = connection.prepareStatement(queryStr);
      ResultSet resultSet = preparedStatement.executeQuery();

      ResultSetMetaData metaData = resultSet.getMetaData();
      int columnCount = metaData.getColumnCount();

      while (resultSet.next()) {
        Map<String, Object> row = new LinkedHashMap<>();
        for (int i = 1; i <= columnCount; i++) {
          row.put(metaData.getColumnName(i), resultSet.getObject(i));
        }

        data.add(row);
      }

    } catch (SQLException e) {
      e.printStackTrace();
    }

    return data;
  }

  public List<String> vfSelectVis(VFVisSelectRequest request) throws SQLException {

    List<String> result = new ArrayList<>();

    String id = request.getVisId();

    if (BASIC_VIS_TYPES.contains(id)) {
      for (TableMetadata table : databaseMetadata) {
        List<Column> columns = table.getColumns().stream().filter(col -> !(col.isForeignKey() && !col.isPrimaryKey()))
            .toList();
        int numPks = (int) columns.stream().filter(Column::isPrimaryKey).count();
        int totalFks = (int) columns.stream().filter(col -> col.isForeignKey() && col.isPrimaryKey()).count();

        Column pk = columns.stream().filter(Column::isPrimaryKey).findFirst().get();
        List<String> attTypes = columns.stream().filter(col -> !col.isPrimaryKey() && !col.isForeignKey())
            .map(Column::getType).toList();

        if (isBasicEntity(numPks, totalFks, List.of(table), columns)) {
          if (id.equals("bar")) {
            if (attTypes.stream().filter(this::isScalarType).count() >= 1) {
              result.add(table.getTableName());
            }
          } else if (id.equals("calendar")) {
            if (attTypes.stream().filter(TEMP_TYPES::contains).count() >= 1) {
              result.add(table.getTableName());
            }
          } else if (id.equals("scatter")) {
            if (attTypes.stream().filter(this::isScalarType).count() >= 2) {
              result.add(table.getTableName());
            }
          } else if (id.equals("bubble")) {
            if (attTypes.stream().filter(this::isScalarType).count() >= 3) {
              result.add(table.getTableName());
            }
          } else if (id.equals("choropleth")) {
            boolean geographicalKey = GEO_TABLE_NAMES.contains(pk.getName())
                || (GEO_TABLE_NAMES.contains(pk.getTableName()) && GEO_COLUMN_NAMES.contains(pk.getName()));
            if (attTypes.size() >= 1 && geographicalKey) {
              result.add(table.getTableName());
            }
          } else if (id.equals("word-cloud")) {
            if (LEX_TYPES.contains(pk.getType()) && attTypes.stream().filter(this::isScalarType).count() >= 1) {
              result.add(table.getTableName());
            }
          }
        }
      }
    } else if (WEAK_VIS_TYPES.contains(id)) {
      for (TableMetadata table : databaseMetadata) {
        List<Column> columns = table.getColumns();

        Column k2 = columns.stream().filter(col -> col.isPrimaryKey() && !col.isForeignKey()).findFirst().orElse(null);

        if (k2 == null) {
          continue;
        }

        List<String> pkNames = columns.stream().filter(Column::isPrimaryKey).map(Column::getName).toList();
        List<String> fkNames = columns.stream().filter(Column::isForeignKey).map(Column::getName).toList();

        List<String> attTypes = columns.stream().filter(col -> !col.isPrimaryKey() && !col.isForeignKey())
            .map(Column::getType).toList();

        if (isWeakEntity(List.of(table), columns)) {
          if (id.equals("line")) {
            if (isScalarType(k2.getType()) && attTypes.stream().filter(this::isScalarType).count() >= 1) {
              result.add(table.getTableName());
            }
          } else if (id.equals("stacked-bar")) {
            if (isCompleteWeak(pkNames, fkNames, List.of(table.getTableName()))
                && attTypes.stream().filter(this::isScalarType).count() >= 1) {
              result.add(table.getTableName());
            }
          } else if (id.equals("grouped-bar")) {
            if (attTypes.stream().filter(this::isScalarType).count() >= 1) {
              result.add(table.getTableName());
            }
          } else if (id.equals("spider")) {
            if (isCompleteWeak(pkNames, fkNames, List.of(table.getTableName()))
                && attTypes.stream().filter(this::isScalarType).count() >= 1) {
              result.add(table.getTableName());
            }
          }
        }
      }
    } else if (ONE_MANY_VIS_TYPES.contains(id)) {
      for (TableMetadata table : databaseMetadata) {
        List<Column> columns = table.getColumns();
        int numPks = (int) columns.stream().filter(Column::isPrimaryKey).count();
        int numPureFks = (int) columns.stream().filter(col -> col.isForeignKey() && !col.isPrimaryKey()).count();

        List<String> attTypes = columns.stream().filter(col -> !col.isPrimaryKey() && !col.isForeignKey())
            .map(Column::getType).toList();

        if (isOneManyRelationship(numPks, numPureFks, List.of(table), columns)) {
          if (id.equals("hierarchy-tree")) {
            result.add(table.getTableName());
          } else if (id.equals("treemap")) {
            if (attTypes.stream().filter(this::isScalarType).count() >= 1) {
              result.add(table.getTableName());
            }
          } else if (id.equals("circle-packing")) {
            if (attTypes.stream().filter(this::isScalarType).count() >= 1) {
              result.add(table.getTableName());
            }
          }
        }
      }
    } else if (MANY_MANY_VIS_TYPES.contains(id)) {
      for (TableMetadata table : databaseMetadata) {
        List<Column> columns = table.getColumns();
        int numPks = (int) columns.stream().filter(Column::isPrimaryKey).count();

        List<String> attTypes = columns.stream().filter(col -> !col.isPrimaryKey() && !col.isForeignKey())
            .map(Column::getType).toList();

        if (isManyManyRelationship(numPks, List.of(table))) {
          if (id.equals("sankey")) {
            if (attTypes.stream().filter(this::isScalarType).count() >= 1) {
              result.add(table.getTableName());
            }
          }
        }
      }
    } else if (REFLEXIVE_VIS_TYPES.contains(id)) {
      for (TableMetadata table : databaseMetadata) {
        List<Column> columns = table.getColumns();
        int numPks = (int) columns.stream().filter(Column::isPrimaryKey).count();

        List<String> attTypes = columns.stream().filter(col -> !col.isPrimaryKey() && !col.isForeignKey())
            .map(Column::getType).toList();

        if (isManyManyRelationship(numPks, List.of(table)) && isReflexive(List.of(table))) {
          if (attTypes.stream().filter(this::isScalarType).count() >= 1) {
            result.add(table.getTableName());
          }
        }
      }
    }

    return result;
  }
}