import React, { useState, useEffect } from "react";
import { Avatar, Checkbox, Flex, Layout, Menu, Spin, Table, Tooltip, Modal, Input, InputNumber, Select } from 'antd';
import 'antd/dist/reset.css';
import { Content, Header } from "antd/es/layout/layout";
import Bar from "../components/charts/basic/Bar";
import Bubble from "../components/charts/basic/Bubble";
import Scatter from "../components/charts/basic/Scatter";
import WordCloud from "../components/charts/basic/WordCloud";
import Choropleth from "../components/charts/basic/Choropleth";
import Chord from "../components/charts/manymany/Chord";
import Sankey from "../components/charts/manymany/Sankey";
import Line from "../components/charts/weak/Line";
import StackedBar from "../components/charts/weak/StackedBar";
import GroupedBar from "../components/charts/weak/GroupedBar";
import Spider from "../components/charts/weak/Spider";
import TreeMap from "../components/charts/onemany/TreeMap";
import CirclePacking from "../components/charts/onemany/CirclePacking";
import Calendar from "../components/charts/basic/Calendar";
import NetworkChart from "../components/charts/manymany/NetworkChart";
import HierarchyTree5 from "../components/charts/onemany/HierarchyTree5";

function DataFirst() {

  const chartTypes = [
    {
      id: "bar",
      name: "Bar Chart",
      pattern: "basic",
      image: "bar.png"
    },
    {
      id: "bubble",
      name: "Bubble Chart",
      pattern: "basic",
      image: "bubble.png"
    },
    {
      id: "calendar",
      name: "Calendar Chart",
      pattern: "basic",
      image: "calendar.png"
    },
    {
      id: "choropleth",
      name: "Choropleth Map",
      pattern: "basic",
      image: "choropleth.png"
    },
    {
      id: "scatter",
      name: "Scatter Chart",
      pattern: "basic",
      image: "scatter.png"
    },
    {
      id: "word-cloud",
      name: "Word Cloud",
      pattern: "basic",
      image: "word-cloud.png"
    },
    {
      id: "line",
      name: "Line Chart",
      pattern: "weak",
      image: "line.png"
    },
    {
      id: "grouped-bar",
      name: "Grouped Bar Chart",
      pattern: "weak",
      image: "grouped-bar.png"
    },
    {
      id: "stacked-bar",
      name: "Stacked Bar Chart",
      pattern: "weak",
      image: "stacked-bar.png"
    },
    {
      id: "spider",
      name: "Spider Chart",
      pattern: "weak",
      image: "spider.png"
    },
    {
      id: "circle-packing",
      name: "Circle Packing",
      pattern: "one-many",
      image: "circle-packing.png"
    },
    {
      id: "hierarchy-tree",
      name: "Hierarchy Tree",
      pattern: "one-many",
      image: "hierarchy-tree.png"
    },
    {
      id: "treemap",
      name: "Treemap",
      pattern: "one-many",
      image: "treemap.png"
    },
    {
      id: "chord",
      name: "Chord Diagram",
      pattern: "many-many",
      image: "chord.png"
    },
    {
      id: "sankey",
      name: "Sankey Diagram",
      pattern: "many-many",
      image: "sankey.png"
    },
    {
      id: "network",
      name: "Network Chart",
      pattern: "many-many",
      image: "network.png"
    },
  ];

  const [tableMetadata, setTableMetadata] = useState([]);
  const [shownTables, setShownTables] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [visOptions, setVisOptions] = useState([]);
  const [pattern, setPattern] = useState('');
  const [graph, setGraph] = useState(null);
  const [limit, setLimit] = useState("");
  const [filters, setFilters] = useState({});

  const columns = chartData.length > 0 ? Object.keys(chartData[0]).map((column, index) => ({ title: column, dataIndex: column, key: index })) : [];

  const pages = new Array(3).fill(null).map((_, index) => ({
    key: index + 1,
    label: index === 0 ? (<a href="/">CONNECT</a>) : index === 1 ? (<a href="/data-first">DATA-FIRST</a>) : (<a href="/viz-first">VIZ-FIRST</a>),
  }));

  useEffect(() => {

    async function fetchTableMetadata() {
      const response = await fetch('http://localhost:8080/api/v1/tables/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        Modal.error({
          title: 'Error!',
          content: 'Failed to fetch table metadata.',
        });
        return;
      }

      const data = await response.json();
      setTableMetadata(data);
      if (shownTables.length === 0) {
        setShownTables(data.map((table) => table.tableName));
      }
      console.log("Table Metadata:");
      console.log(data)
    }

    fetchTableMetadata();
  }, []);

  const handleRenderButtonClick = async () => {

    if (selectedColumns.length === 0) {
      Modal.error({
        title: 'No columns selected!',
        content: 'Please select columns to visualise',
      });
      return;
    }

    if (limit !== "" && !Number.isInteger(parseInt(limit))) {
      Modal.error({
        title: 'Invalid row limit!',
        content: 'Please enter a valid integer value for the row limit.',
      });
      return;
    }

    const usedFilters = {};

    for (let fullColumnName of Object.keys(filters)) {
      const filter = filters[fullColumnName];

      if (filter.type === "num" && filter.value !== "" && !Number.isInteger(parseInt(filter.value))) {
        Modal.error({
          title: 'Invalid filter value!',
          content: 'Please enter a valid integer value for the filter.',
        });
        return;
      }

      if (filter.value !== "") {
        usedFilters[fullColumnName] = filter;
      }
    }

    setPattern('');
    setVisOptions([]);
    setChartData([]);

    const formData = {
      pattern: "",
      tables: [],
      columns: selectedColumns.map((col) => col.fullColumnName),
      filters: usedFilters,
      limit: limit === "" ? -1 : parseInt(limit)
    };

    selectedColumns.forEach((col) => {
      const tableName = col.fullColumnName.split('.')[0];
      if (!formData.tables.includes(tableName)) {
        formData.tables.push(tableName);
      }
    });

    const response = await fetch('http://localhost:8080/api/v1/df-visualise/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      Modal.error({
        title: 'Error!',
        content: 'Failed to generate results.',
      });
      return;
    }

    const data = await response.json();
    setPattern(data.pattern);
    setVisOptions(data.visualisations);
    setChartData(data.data);

    console.log("Data:");
    console.log(data);
  };

  const handleCheckboxChange = (fullColumnName, columnObj) => {
    const isSelected = selectedColumns.find(col => col.fullColumnName === fullColumnName);
    if (isSelected) {
      if (selectedColumns.length === 1) {
        setShownTables(tableMetadata.map((table) => table.tableName));
      }

      const updatedFilters = { ...filters };
      delete updatedFilters[fullColumnName];
      setFilters(updatedFilters);
      setSelectedColumns(prevSelected => prevSelected.filter(col => col.fullColumnName !== fullColumnName));
    } else {
      const isNumericType = ['int2', 'int4', 'int8', 'float4', 'float8', 'numeric'].includes(columnObj.type);
      const isLexicalType = ['varchar', 'text', 'char', 'bpchar'].includes(columnObj.type);

      if (isNumericType || isLexicalType) {
        setFilters(prevFilters => ({ ...prevFilters, [fullColumnName]: { comparator: "=", value: "", type: isNumericType ? "num" : "lex" } }));
      }

      const tableName = fullColumnName.split('.')[0];
      setShownTables([tableName]);
      setSelectedColumns(prevSelected => [...prevSelected, { fullColumnName, type: columnObj.type }]);
    }
  };

  const generateFilterComponent = (fullColumnName, filter) => {

    const isNumericType = filter.type === "num";

    const numComparators = (
      <Select defaultValue="=" style={{ width: "60px" }} onChange={(comp) => handleFilterComparatorChange(fullColumnName, comp)}>
        <Select.Option value="=">{"="}</Select.Option>
        <Select.Option value="!=">{"!="}</Select.Option>
        <Select.Option value=">">{">"}</Select.Option>
        <Select.Option value="<">{"<"}</Select.Option>
        <Select.Option value=">=">{">="}</Select.Option>
        <Select.Option value="<=">{"<="}</Select.Option>
      </Select>
    );

    const lexComparators = (
      <Select defaultValue="=" style={{ width: "60px" }} onChange={(comp) => handleFilterComparatorChange(fullColumnName, comp)}>
        <Select.Option value="=">{"="}</Select.Option>
        <Select.Option value="!=">{"!="}</Select.Option>
      </Select>
    );

    const numInput = (
      <InputNumber addonBefore={numComparators} value={filters[fullColumnName].value} placeholder="Enter value..." style={{ width: "100%" }} onChange={(val) => handleFilterValueChange(fullColumnName, val)} />
    );

    const lexInput = (
      <Input addonBefore={lexComparators} value={filters[fullColumnName].value} placeholder="Enter value..." style={{ width: "100%" }} onChange={(e) => handleFilterValueChange(fullColumnName, e.target.value)} />
    );

    return (
      <div style={{ paddingBottom: "10px" }}>
        <h3><strong>{fullColumnName}</strong></h3>
        {isNumericType ? numInput : lexInput}
      </div>
    );
  };

  const handleFilterComparatorChange = (fullColumnName, comparator) => {
    setFilters(prevFilters => ({ ...prevFilters, [fullColumnName]: { ...prevFilters[fullColumnName], comparator } }));
  };

  const handleFilterValueChange = (fullColumnName, value) => {
    setFilters(prevFilters => ({ ...prevFilters, [fullColumnName]: { ...prevFilters[fullColumnName], value } }));
  };

  const generateColumnComponent = (table, column) => {
    const isNumericType = ['int2', 'int4', 'int8', 'float4', 'float8', 'numeric'].includes(column.type);
    const isTemporalType = ['date', 'time', 'timestamp'].includes(column.type);
    const isTemporalVar = ['year'].includes(column.name);
    const isLexicalType = ['varchar', 'text', 'char', 'bpchar'].includes(column.type);
    const isGoegraphicalType = (['country', 'city', 'state', 'province'].includes(table.tableName) && ['name', 'code'].includes(column.name)) || ['country', 'city', 'state', 'province'].includes(column.name);
    const isPrimaryKey = column.primaryKey;
    const isForeignKey = column.foreignKey;

    const numIcon = isNumericType && (
      <Tooltip title="This column has a NUMERIC data type.">
        <Avatar style={{ backgroundColor: "lightblue" }} size="small">N</Avatar>
      </Tooltip>
    );

    const tempIcon = isTemporalType && (
      <Tooltip title="This column has a TEMPORAL data type.">
        <Avatar style={{ backgroundColor: "lightgreen" }} size="small">T</Avatar>
      </Tooltip>
    );

    const tempVarIcon = isTemporalVar && (
      <Tooltip title="This column represents a TEMPORAL variable.">
        <Avatar style={{ backgroundColor: "lightgreen" }} size="small">T</Avatar>
      </Tooltip>
    );

    const lexIcon = isLexicalType && (
      <Tooltip title="This column has a LEXICAL data type.">
        <Avatar style={{ backgroundColor: "lightcoral" }} size="small">L</Avatar>
      </Tooltip>
    );

    const geoIcon = isGoegraphicalType && (
      <Tooltip title="This column represents a GEOGRAPHICAL location.">
        <Avatar style={{ backgroundColor: "teal" }} size="small">G</Avatar>
      </Tooltip>
    );

    const pkIcon = isPrimaryKey && (
      <Tooltip title="This column is part of the table's PRIMARY KEY.">
        <Avatar style={{ backgroundColor: "navy" }} size="small">PK</Avatar>
      </Tooltip>
    );

    const fkIcon = isForeignKey && (
      <Tooltip title={`This column is a FOREIGN KEY to ${findFkParentColumn(table.foreignKeys, column.name)}`}>
        <Avatar style={{ backgroundColor: "darkgreen" }} size="small">FK</Avatar>
      </Tooltip>
    );

    return (
      <div style={{
        display: "flex",
        paddingBottom: "5px",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <Checkbox
          style={{ paddingBottom: "5px" }}
          checked={selectedColumns.find(col => col.fullColumnName === `${table.tableName}.${column.name}`)}
          onChange={() => handleCheckboxChange(`${table.tableName}.${column.name}`, column)}
        >
          {column.name}
        </Checkbox>
        <div style={{ display: "flex", gap: "5px" }}>
          {numIcon}
          {tempIcon}
          {tempVarIcon}
          {lexIcon}
          {geoIcon}
          {pkIcon}
          {fkIcon}
        </div>
      </div>
    );
  };

  const findFkParentColumn = (tableFks, columnName) => {

    var result = "PARENT NOT FOUND";

    tableFks.forEach((fk) => {
      if (fk.childColumn === columnName) {
        result = `${fk.parentTable}.${fk.parentColumn}`;
      }
    });

    return result;
  };

  const generatePatternComponent = (pattern) => {
    const patternTitle = {
      "basic": "Basic Entity",
      "weak": "Weak Entity",
      "one-many": "One-Many Relationship",
      "many-many": "Many-Many Relationship",
      "reflexive": "Reflexive Many-Many Relationship",
      "none": "No Pattern Detected"
    };

    const patternDescription = {
      "basic": "This entity is not dependent on any other entity.",
      "weak": "This entity is dependent on another entity. Part of its primary key is a foreign key to another entity.",
      "one-many": "This selection includes a one-to-many relationship with another entity.",
      "many-many": "This selection represents a many-to-many relationship between two different entities.",
      "reflexive": "This selection represents a many-to-many relationship between the same entity.",
      "none": "No schema pattern was detected."
    };

    const patternIcon = {
      "basic": (<Avatar style={{ backgroundColor: "lightblue" }} size="large">B</Avatar>),
      "weak": (<Avatar style={{ backgroundColor: "lightgreen" }} size="large">W</Avatar>),
      "one-many": (<Avatar style={{ backgroundColor: "lightcoral" }} size="large">OM</Avatar>),
      "many-many": (<Avatar style={{ backgroundColor: "navy" }} size="large">MM</Avatar>),
      "reflexive": (<Avatar style={{ backgroundColor: "darkgreen" }} size="large">R</Avatar>),
      "none": (<Avatar style={{ backgroundColor: "grey" }} size="large">N</Avatar>)
    };

    return pattern !== '' && (
      <div style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        border: "2px solid #ccc",
        borderRadius: "10px",
        backgroundColor: "#fff"
      }}>
        <div style={{ width: "25%" }}>{patternIcon[pattern]}</div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", paddingLeft: "10px" }}>
          <h3><strong>{patternTitle[pattern]}</strong></h3>
          <p>{patternDescription[pattern]}</p>
        </div>
      </div>
    );
  };

  const generateVisualisationComponent = (vis) => {

    var visName = "No Viz Options Available";
    var visIcon = "none.png";

    chartTypes.forEach((chart) => {
      if (vis && chart.id === vis.id) {
        visName = chart.name;
        visIcon = chart.image;
      }
    });

    return (
      <div style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        width: "95%",
        padding: "25px 20px",
        border: "2px solid #ccc",
        borderRadius: "10px",
        marginBottom: "10px",
        backgroundColor: "#fff",
        cursor: `${vis ? "pointer" : "default"}`
      }} onClick={() => vis && generateChart(vis)}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%" }}>
          <h3><strong>{visName}</strong></h3>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <img src={require(`../assets/${visIcon}`)} alt={visName} style={{ width: "40%" }} />
        </div>
      </div>
    )
  };

  const generateChart = (vis) => {
    setGraph(null);
    setModalVisible(true);
    console.log("Chart Data:");
    console.log(chartData);

    const key1 = vis.key1;
    const key2 = vis.key2;
    const attributes = vis.attributes;

    const keys = [key1, key2];

    console.log("Keys and Attributes:");
    console.log(keys);
    console.log(attributes);

    switch (vis.id) {
      case "bar":
        setGraph(<Bar data={chartData} categoryField={key1} valueField={attributes[0]} />);
        break;
      case "calendar":
        setGraph(<Calendar data={chartData} categoryField={key1} valueField={attributes[0]} />);
        break;
      case "bubble":
        setGraph(<Bubble data={chartData} categoryField={key1} valueFields={attributes} />);
        break;
      case "scatter":
        setGraph(<Scatter data={chartData} categoryField={key1} valueFields={attributes} />);
        break;
      case "word-cloud":
        setGraph(<WordCloud data={chartData} categoryField={key1} valueField={attributes[0]} />);
        break;
      case "choropleth":
        setGraph(<Choropleth data={chartData} categoryField={key1} valueField={attributes[0]} />);
        break;
      case "chord":
        setGraph(<Chord data={chartData} categoryFields={keys} valueField={attributes[0]} />);
        break;
      case "sankey":
        setGraph(<Sankey data={chartData} categoryFields={keys} valueField={attributes[0]} />);
        break;
      case "line":
        setGraph(<Line data={chartData} categoryFields={keys} valueField={attributes[0]} />);
        break;
      case "stacked-bar":
        setGraph(<StackedBar data={chartData} categoryFields={keys} valueFields={attributes} />);
        break;
      case "grouped-bar":
        setGraph(<GroupedBar data={chartData} categoryFields={keys} valueField={attributes[0]} />);
        break;
      case "spider":
        setGraph(<Spider data={chartData} categoryFields={keys} valueField={attributes[0]} />);
        break;
      case "treemap":
        setGraph(<TreeMap data={chartData} categoryFields={keys} valueField={attributes[0]} />);
        break;
      case "circle-packing":
        setGraph(<CirclePacking data={chartData} categoryFields={keys} valueField={attributes[0]} />);
        break;
      case "hierarchy-tree":
        setGraph(<HierarchyTree5 data={chartData} categoryFields={keys} />);
        break;
      case "network":
        setGraph(<NetworkChart data={chartData} categoryFields={keys} />);
        break;
      default:
        setGraph(null);
        break;
    }
  };

  const clearOutput = () => {
    setChartData([]);
    setSelectedColumns([]);
    setPattern('');
    setVisOptions([]);
    setGraph(null);
    setModalVisible(false);
    setShownTables(tableMetadata.map((table) => table.tableName));
    setLimit("");
    setFilters({});
  };

  const clearGraph = () => {
    setGraph(null);
    setModalVisible(false);
  };

  return (
    <>
      <Layout>
        <Header style={{ display: "flex", flexDirection: "row", alignItems: "flex-start", justifyContent: "center", gap: "20px" }}>
          <img src={require("../assets/vizer-logo-zip-file/png/logo-no-background.png")} alt="logo" style={{ width: "7%", paddingTop: "15px" }} />
          <Menu
            theme="dark"
            mode="horizontal"
            defaultSelectedKeys={['2']}
            items={pages}
            style={{ flex: 1, minWidth: 0 }}
          />
        </Header>
        <Content>
          <div style={{ display: "flex", height: "95vh", width: "100%", backgroundColor: "#001529", justifyContent: "center" }}>
            <Flex align="flex-start" gap="small" style={{ backgroundColor: "#fff", width: "98%", height: "95%", borderRadius: "5px" }}>
              <div style={{ minWidth: "20vw", maxWidth: "20vw", height: "100%", padding: "1%" }}>
                <div style={{ display: "flex", marginTop: "10px", justifyContent: "center" }}>
                  <h2><strong>Tables</strong></h2>
                </div>
                <div style={{ height: "95%", overflowY: "auto", paddingRight: "2%" }}>
                  <Spin spinning={tableMetadata.length === 0}>
                    {tableMetadata.filter((table) => shownTables.includes(table.tableName)).map((table, index) => (
                      <div key={index} style={{ padding: "10px" }}>
                        <h2 style={{ paddingBottom: "5px", borderBottom: "1px solid #ccc" }}>{table.tableName}</h2>
                        {table.columns.map((column, index) => (
                          <div key={index}>
                            {generateColumnComponent(table, column)}
                          </div>
                        ))}
                      </div>
                    ))}
                  </Spin>
                </div>
              </div>

              <div style={{
                height: "100%",
                minWidth: "15vw",
                maxWidth: "15vw",
                paddingRight: "1%",
                paddingTop: "1%",
                paddingBottom: "1%",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                alignItems: "center"
              }}>
                <div style={{ display: "flex", alignItems: "center", paddingBottom: "10px", paddingTop: "10px" }}>
                  <button style={{ marginRight: "5px" }} className="btn" onClick={handleRenderButtonClick}>GENERATE</button>
                  <button className="btn red-btn" onClick={clearOutput}>CLEAR</button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", paddingTop: "10px", borderTop: "1px solid #ccc" }}>
                  <h2><strong>Selected Columns</strong></h2>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", paddingBottom: "10px" }}>
                    {selectedColumns.map((selected, index) => (
                      <div key={index}>
                        {selected.fullColumnName}
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", maxHeight: "50%", overflowY: "auto", borderTop: "1px solid #ccc", paddingTop: "10px", paddingBottom: "10px" }}>
                  <h2><strong>Filters</strong></h2>
                  <div style={{ height: "100%", overflowY: "auto", paddingRight: "2%" }}>
                    {filters && Object.keys(filters).map((fullColumnName, index) => (
                      <div key={index}>
                        {generateFilterComponent(fullColumnName, filters[fullColumnName])}
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", borderTop: "1px solid #ccc", paddingTop: "10px" }}>
                  <h2><strong>Limit Row Count</strong></h2>
                  <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: "5px", width: "100%" }}>
                    <InputNumber
                      style={{ width: "100%" }}
                      value={limit}
                      placeholder="Enter max no. rows..."
                      onChange={(value) => setLimit(value)}
                    />
                  </div>
                </div>
              </div>

              <div style={{
                marginRight: "20px",
                paddingRight: "1%",
                paddingTop: "1%",
                paddingBottom: "1%",
                height: "100%",
                minWidth: "20vw",
                maxWidth: "20vw",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginBottom: "20px", marginTop: "10px" }}>
                  <h2 style={{ marginBottom: "10px" }}><strong>Pattern Detected</strong></h2>
                  {generatePatternComponent(pattern)}
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderTop: "1px solid #ccc", paddingTop: "20px", width: "100%" }}>
                  <h2><strong>Visualisation Options</strong></h2>
                  {visOptions.length === 0 && pattern !== "" ? generateVisualisationComponent(null) : visOptions.map((vis, index) => (
                    <div key={index} style={{ width: "100%" }} >
                      {generateVisualisationComponent(vis)}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ height: "100%", marginTop: "10px", maxWidth: "40vw", paddingRight: "1%", paddingTop: "1%", paddingBottom: "1%" }}>
                <h1><strong>Result Data</strong></h1>
                <div style={{ height: "90%", paddingTop: "1%", width: "100%" }}>
                  <p>NUMBER OF ROWS: {chartData.length}</p>
                  {chartData.length !== 0 && (
                    <div style={{ width: "100%", height: "100%", overflowY: "auto", overflowX: "auto" }}>
                      <Table bordered dataSource={chartData} columns={columns} className="custom-table-header" />
                    </div>
                  )}
                </div>
              </div>
            </Flex>
          </div>
          <Modal open={modalVisible} onCancel={clearGraph} width="80%" style={{ paddingTop: "20px" }} footer={[]}>
            {graph}
          </Modal>
        </Content>
      </Layout>
    </>
  );
}

export default DataFirst;
