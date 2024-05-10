import React, { useState, useEffect } from "react";
import { Avatar, Checkbox, Flex, Layout, Menu, Spin, Table, Tooltip, Modal } from 'antd';
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

function VizFirst() {

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
    }
  ];

  const [selectedChartType, setSelectedChartType] = useState("");
  const [tableMetadata, setTableMetadata] = useState([]);
  const [shownTables, setShownTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [pattern, setPattern] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [graph, setGraph] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

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
          title: "Error!",
          content: "Failed to fetch table metadata.",
        });
        return;
      }

      const data = await response.json();
      setTableMetadata(data);
      setShownTables(data.map((table) => table.tableName));
      console.log("Table Metadata:");
      console.log(data)
    }

    fetchTableMetadata();
  }, []);

  const handleSelectChartType = async (id) => {
    
    const response = await fetch("http://localhost:8080/api/v1/vf-select/", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        visId: id,
      }),
    });
    
    if (!response.ok) {
      Modal.error({
        title: "Error!",
        content: "Failed to select this visualisation type. Try again.",
      });
      return;
    }
    
    const data = await response.json();
    console.log("Possible Tables:");
    console.log(data);
    setShownTables(data);
    setSelectedChartType(id);
  };

  const handleRenderButtonClick = async () => {
    setLoading(true);

    if (selectedTable === "") {
      Modal.error({
        title: "No table selected!",
        content: "Please select a table and a visualisation type to generate the visualisation.",
      });
      setLoading(false);
      return;
    }

    if (selectedChartType === "") {
      Modal.error({
        title: "No visualisation type selected!",
        content: "Please select a visualisation type to generate the visualisation.",
      });
      setLoading(false);
      return;
    }

    const response = await fetch("http://localhost:8080/api/v1/vf-generate/", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        visId: selectedChartType,
        table: selectedTable,
      }),
    });

    if (!response.ok) {
      Modal.error({
        title: "Error!",
        content: "Failed to generate any visualisation options.",
      });
      setLoading(false);
      return;
    }

    const data = await response.json();
    setPattern(data.pattern);
    setResults(data.options);
    console.log("Results:");
    console.log(data);

    setLoading(false);
  };

  const generateColumnComponent = (table, column) => {
    const isNumericType = ['int2', 'int4', 'int8', 'float4', 'float8', 'numeric'].includes(column.type);
    const isTemporalType = ['date', 'time', 'timestamp'].includes(column.type);
    const isTemporalVar = ['year'].includes(column.name);
    const isLexicalType = ['varchar', 'text', 'char'].includes(column.type);
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
        {column.name}
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
      "basic": "This visualisation is suited for a basic entity, one that is not dependent on any other entity.",
      "weak": "This visualisation is suited for a weak entity. This entity type is dependent on a parent entity. Part of its primary key is a foreign key to another entity.",
      "one-many": "This visualisation is suited for a one-to-many relationship with another entity.",
      "many-many": "This visualisation is suited for a many-to-many relationship between two different entities.",
      "reflexive": "This visualisation is suited for a many-to-many relationship between the same entity.",
      "none": "This visualisation does not have a specified link to any schema pattern."
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

    if (vis === null) {
      return (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          padding: "20px",
          marginBottom: "10px",
          border: "2px solid #ccc",
          borderRadius: "10px",
          backgroundColor: "#fff",
        }}>
          <h3><strong>No Viz Options Available</strong></h3>
          <p>There are no visualisation options available for the selected table and visualisation type.</p>
        </div>
      );
    }

    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        padding: "20px",
        marginBottom: "10px",
        border: "2px solid #ccc",
        borderRadius: "10px",
        backgroundColor: "#fff",
        cursor: "pointer"
      }} onClick={() => generateChart(vis)}>
        <h3 style={{ borderBottom: "2px solid #ccc" }}><strong>{vis.title}</strong></h3>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <p><strong>Key 1: </strong>{vis.key1}</p>
          {vis.key2 && <p><strong>Key 2: </strong>{vis.key2}</p>}
          <p><strong>Attributes: </strong>{vis.attributes.join(", ")}</p>
        </div>
      </div>
    )
  };

  const generateChart = async (vis) => {

    const key1 = vis.key1;
    const key2 = vis.key2;
    const attributes = vis.attributes;

    const keys = [key1, key2];

    const formData = {
      pattern,
      tables: [selectedTable],
      columns: []
    };

    if (vis.key2) {
      formData.columns.push(...key1.split(" | "));
      formData.columns.push(key2);
      formData.columns.push(...attributes);
    } else {
      formData.columns.push(key1);
      formData.columns.push(...attributes);
    }

    const response = await fetch("http://localhost:8080/api/v1/vf-execute/", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      Modal.error({
        title: "Error!",
        content: "Failed to generate the visualisation.",
      });
      return;
    }

    const data = await response.json();
    setChartData(data);

    setGraph(null);
    setModalVisible(true);

    switch (vis.id) {
      case "bar":
        setGraph(<Bar data={data} categoryField={key1} valueField={attributes[0]} />);
        break;
      case "bubble":
        setGraph(<Bubble data={data} categoryField={key1} valueFields={attributes} />);
        break;
      case "scatter":
        setGraph(<Scatter data={data} categoryField={key1} valueFields={attributes} />);
        break;
      case "word-cloud":
        setGraph(<WordCloud data={data} categoryField={key1} valueField={attributes[0]} />);
        break;
      case "choropleth":
        setGraph(<Choropleth data={data} categoryField={key1} valueField={attributes[0]} />);
        break;
      case "chord":
        setGraph(<Chord data={data} categoryFields={keys} valueField={attributes[0]} />);
        break;
      case "sankey":
        setGraph(<Sankey data={data} categoryFields={keys} valueField={attributes[0]} />);
        break;
      case "line":
        setGraph(<Line data={data} categoryFields={keys} valueField={attributes[0]} />);
        break;
      case "stacked-bar":
        setGraph(<StackedBar data={data} categoryFields={keys} valueFields={attributes} />);
        break;
      case "grouped-bar":
        setGraph(<GroupedBar data={data} categoryFields={keys} valueField={attributes[0]} />);
        break;
      case "spider":
        setGraph(<Spider data={data} categoryFields={keys} valueField={attributes[0]} />);
        break;
      case "treemap":
        setGraph(<TreeMap data={data} categoryFields={keys} valueField={attributes[0]} />);
        break;
      case "circle-packing":
        setGraph(<CirclePacking data={data} categoryFields={keys} valueField={attributes[0]} />);
        break;
      case "calendar":
      case "hierarchy-tree":
      case "heatmap":
      case "network":
      default:
        setGraph(null);
        break;
    }
  };

  const generateVisOptionComponent = (vis) => {

    return (
      <div style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        padding: "30px 20px",
        border: `2px solid ${selectedChartType === vis.id ? "#fff" : "#ccc"}`,
        borderRadius: "10px",
        marginBottom: "10px",
        backgroundColor: selectedChartType === vis.id ? "#1677ff" : "#fff",
        cursor: "pointer",
        color: selectedChartType === vis.id ? "#fff" : "#000",
        transition: "all 0.2s ease-in-out"
      }} onClick={() => handleSelectChartType(vis.id)}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%" }}>
          <h3><strong>{vis.name}</strong></h3>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <img src={require(`../assets/${vis.image}`)} alt={vis.name} style={{ width: "40%" }} />
        </div>
      </div>
    )
  };

  const clearOutput = () => {
    setShownTables(tableMetadata.map((table) => table.tableName));
    setPattern("");
    setResults([]);
    setLoading(false);
    setSelectedChartType("");
    setSelectedTable("");
    setChartData([]);
    setGraph(null);
  };

  const clearGraph = () => {
    setGraph(null);
    setModalVisible(false);
  };

  return (
    <>
      <Layout>
        <Header style={{ display: 'flex', alignItems: 'center' }}>
          <div className="demo-logo" />
          <Menu
            theme="dark"
            mode="horizontal"
            defaultSelectedKeys={['3']}
            items={pages}
            style={{ flex: 1, minWidth: 0 }}
          />
        </Header>
        <Content>
          <div style={{ display: "flex", height: "95vh", width: "100%" }}>
            <Flex align="flex-start" gap="small">
              <div style={{
                minWidth: "20vw", maxWidth: "20vw", height: "100%", overflowY: "auto", padding: "1%",
                // borderRight: "5px solid #ccc", 
                justifyContent: "center"
              }}>
                <div style={{ display: "flex", paddingTop: "10px", justifyContent: "center" }}>
                  <h2><strong>Visualisation Types</strong></h2>
                </div>
                {chartTypes.map((vis) => (
                  <div key={vis.id} color="#000">
                    {generateVisOptionComponent(vis)}
                  </div>
                ))}
              </div>

              <div style={{
                minWidth: "20vw", maxWidth: "20vw", height: "100%", overflowY: "auto", padding: "1%",
                // borderRight: "5px solid #ccc" 
              }}>
                <div style={{ display: "flex", paddingTop: "10px", justifyContent: "center" }}>
                  <h2><strong>Tables</strong></h2>
                </div>
                <Spin spinning={tableMetadata.length === 0}>
                  {tableMetadata.filter((table) => shownTables.includes(table.tableName)).map((table) => (
                    <div key={table.tableName} style={{ padding: "10px" }}>
                      <Checkbox checked={selectedTable === table.tableName} onChange={(e) => setSelectedTable(e.target.checked ? table.tableName : "")}>
                        <h2 style={{ borderBottom: "1px solid #ccc" }}>{table.tableName}</h2>
                      </Checkbox>
                      {table.columns.map((column, index) => (
                        <div key={index}>
                          {generateColumnComponent(table, column)}
                        </div>
                      ))}
                    </div>
                  ))}
                </Spin>
              </div>

              <div style={{
                minWidth: "20vw", maxWidth: "20vw", height: "100%", overflowY: "auto", padding: "1%",
                // borderRight: "5px solid #ccc", 
                marginRight: "20px"
              }}>
                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", marginBottom: "20px", marginTop: "10px" }}>
                  <button style={{ marginRight: "5px", width: "50%" }} className="btn" onClick={handleRenderButtonClick}>GENERATE</button>
                  <button style={{ width: "50%" }} className="btn red-btn" onClick={clearOutput}>CLEAR</button>
                </div>
                <Spin spinning={loading}>
                  <div style={{ marginBottom: "20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <h2 style={{ marginBottom: "10px" }}><strong>Pattern Detected</strong></h2>
                    {generatePatternComponent(pattern)}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", marginTop: "10px", alignItems: "center", justifyContent: "center" }}>
                    <h2><strong>Visualisation Options</strong></h2>
                    {results.length === 0 && pattern !== "" ? generateVisualisationComponent(null) : results.map((res, index) => (
                    <div key={index}>
                      {generateVisualisationComponent(res)}
                    </div>
                  ))}
                  </div>
                </Spin>
              </div>

              <div style={{ height: "100%", marginTop: "20px" }}>
                <h1><strong>Result Table</strong></h1>
                <div style={{ height: "90vh", padding: "1%", overflowY: "auto" }}>
                  <Table dataSource={chartData} columns={columns} />
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

export default VizFirst;