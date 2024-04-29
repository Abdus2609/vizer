// import Modal from "../components/Modal";
import React, { useState, useEffect } from "react";
import { Avatar, Checkbox, Flex, Layout, Menu, Spin, Table, Tooltip, Modal } from 'antd';
import 'antd/dist/reset.css';
// import NavBar from "../components/Navbar";
import { Content, Header } from "antd/es/layout/layout";
// import Bar5 from "../components/charts/basic/Bar5";
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
// import { ref, getDownloadURL } from "firebase/storage";
// import { storage } from "../firebaseconfig";

function Home() {

  const chartTypes = [
    {
      id: "bar",
      name: "Bar Chart",
    },
    {
      id: "bubble",
      name: "Bubble Chart"
    },
    {
      id: "calendar",
      name: "Calendar Chart"
    },
    {
      id: "choropleth",
      name: "Choropleth Map"
    },
    {
      id: "scatter",
      name: "Scatter Chart"
    },
    {
      id: "word-cloud",
      name: "Word Cloud"
    },
    {
      id: "line",
      name: "Line Chart"
    },
    {
      id: "grouped-bar",
      name: "Grouped Bar Chart"
    },
    {
      id: "stacked-bar",
      name: "Stacked Bar Chart"
    },
    {
      id: "spider",
      name: "Spider Chart"
    },
    {
      id: "circle-packing",
      name: "Circle Packing"
    },
    {
      id: "hierarchy-tree",
      name: "Hierarchy Tree"
    },
    {
      id: "treemap",
      name: "Treemap"
    },
    {
      id: "chord",
      name: "Chord Diagram"
    },
    {
      id: "sankey",
      name: "Sankey Diagram"
    }
  ];

  const [tableMetadata, setTableMetadata] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  // const [selectedChartType, setSelectedChartType] = useState('');
  const [visOptions, setVisOptions] = useState([]);
  const [pattern, setPattern] = useState('');
  const [graph, setGraph] = useState(null);

  useEffect(() => {
    async function fetchTableMetadata() {
      const response = await fetch('http://localhost:8080/api/v1/tables/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch table metadata');
      }

      const data = await response.json();
      setTableMetadata(data);
      console.log("Table Metadata:");
      console.log(data)
    }

    fetchTableMetadata();
  }, []);

  const handleRenderButtonClick = async () => {

    if (selectedColumns.length === 0) {
      alert('Please select at least one column');
      return;
    }

    setPattern('');
    setVisOptions([]);
    setChartData([]);

    const formData = {
      tables: [],
      columns: selectedColumns.map((col) => col.column),
    };

    selectedColumns.forEach((col) => {
      const table = col.column.split('.')[0];
      if (!formData.tables.includes(table)) {
        formData.tables.push(table);
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
      throw new Error('Failed to render table');
    }

    const data = await response.json();
    setPattern(data.pattern);
    setVisOptions(data.visualisations);
    setChartData(data.data);

    console.log("Data:");
    console.log(data);
  };

  const handleCheckboxChange = (column, columnType) => {
    const isSelected = selectedColumns.find(col => col.column === column);
    if (isSelected) {
      setSelectedColumns(prevSelected => prevSelected.filter(col => col.column !== column));
    } else {
      setSelectedColumns(prevSelected => [...prevSelected, { column, columnType }]);
    }
  };

  const columns = chartData.length > 0 ? Object.keys(chartData[0]).map((column, index) => ({ title: column, dataIndex: column, key: index })) : [];

  const clearOutput = () => {
    setChartData([]);
    setSelectedColumns([]);
    // setSelectedChartType('');
    setPattern('');
    setVisOptions([]);
    setGraph(null);
    setModalVisible(false);
  }

  const clearGraph = () => {
    setGraph(null);
    setModalVisible(false);
  }

  const findFkParentColumn = (tableFks, columnName) => {

    var result = "PARENT NOT FOUND";

    tableFks.forEach((fk) => {
      if (fk.childColumn === columnName) {
        result = `${fk.parentTable}.${fk.parentColumn}`;
      }
    });

    return result;
  };

  const pages = new Array(3).fill(null).map((_, index) => ({
    key: index + 1,
    label: index === 0 ? (<a href="/">CONNECT</a>) : index === 1 ? (<a href="/home">DATA-FIRST</a>) : (<a href="/vizfirst">VIZ-FIRST</a>),
  }));

  const generateColumn = (table, column) => {
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
        <Checkbox
          style={{ paddingBottom: "5px" }}
          checked={selectedColumns.find(col => col.column === `${table.tableName}.${column.name}`)}
          onChange={() => handleCheckboxChange(`${table.tableName}.${column.name}`, column.type)}
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

    var visName = "";

    chartTypes.forEach((chart) => {
      if (chart.id === vis.name) {
        visName = chart.name;
      }
    });

    return (
      <div style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        padding: "30px",
        border: "2px solid #ccc",
        borderRadius: "10px",
        marginBottom: "10px",
        backgroundColor: "#fff"
      }} onClick={() => generateChart(vis)}>
        <h3><strong>{visName}</strong></h3>
      </div>
    )
  };

  const generateChart = (vis) => {
    setGraph(null);
    setModalVisible(true);
    // setSelectedChartType(vis.name);
    console.log("Chart Data:")
    console.log(chartData);

    const key1 = vis.key1;
    const key2 = vis.key2;
    const attributes = vis.attributes;

    const keys = [key1, key2];

    console.log("Keys and Attributes:");
    console.log(keys);
    console.log(attributes);

    switch (vis.name) {
      case "bar":
        setGraph(<Bar data={chartData} categoryField={key1} valueField={attributes[0]} />);
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
      default:
        setGraph(null);
        break;
    }
  };

  // const getImageUrl = async (visId) => {
  //   try {
  //     const iconRef = ref(storage, `vis-icons/${visId}.png`);
  //     const url = await getDownloadURL(iconRef);
  //     console.log(url);

  //     return url;
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  return (
    <>
      <Layout>
        <Header style={{ display: 'flex', alignItems: 'center' }}>
          <div className="demo-logo" />
          <Menu
            theme="dark"
            mode="horizontal"
            defaultSelectedKeys={['2']}
            items={pages}
            style={{ flex: 1, minWidth: 0 }}
          />
        </Header>
        <Content>
          <div style={{ display: "flex", height: "95vh", width: "100%" }}>
            <Flex align="flex-start" gap="small">
              <div style={{ minWidth: "20vw", maxWidth: "20vw", height: "100%", overflowY: "auto", padding: "1%", borderRight: "5px solid #ccc" }}>
                <Spin spinning={tableMetadata.length === 0}>
                  {tableMetadata.map((table) => (
                    <div key={table.tableName} style={{ padding: "10px" }}>
                      <h2 style={{ paddingBottom: "5px", borderBottom: "1px solid #ccc" }}>{table.tableName}</h2>
                      {table.columns.map((column, index) => (
                        <div>
                          {generateColumn(table, column)}
                        </div>
                      ))}
                    </div>
                  ))}
                </Spin>
              </div>

              <div style={{
                height: "100%",
                minWidth: "15vw",
                maxWidth: "15vw",
                paddingRight: "1%",
                paddingTop: "1%",
                borderRight: "5px solid #ccc",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}>
                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", marginBottom: "20px", marginTop: "10px" }}>
                  <button style={{ marginRight: "5px" }} className="btn" onClick={handleRenderButtonClick}>GENERATE</button>
                  <button className="btn red-btn" onClick={clearOutput}>CLEAR</button>
                </div>
                <div>
                  <h2><strong>Selected Columns</strong></h2>
                  <ul>
                    {selectedColumns.map((selected, index) => (
                      <li style={{ paddingBottom: "2px" }} key={index}>{selected.column}</li>
                    ))}
                  </ul>
                </div>
                <div style={{ display: "flex", justifyContent: "center", width: "100%", borderTop: "5px solid #ccc", paddingTop: "10px" }}>
                  <h2><strong>Filters</strong></h2>
                </div>
              </div>

              <div style={{
                marginRight: "20px",
                padding: "2%",
                borderRight: "5px solid #ccc",
                height: "100%",
                minWidth: "20vw",
                maxWidth: "20vw",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}>
                <div style={{ marginBottom: "20px" }}>
                  <h2 style={{ marginBottom: "10px" }}><strong>Pattern Detected</strong></h2>
                  {generatePatternComponent(pattern)}
                </div>
                <div>
                  <h2><strong>Visualisation Options</strong></h2>
                  {visOptions.map((vis, index) => (
                    <div key={index}>
                      {generateVisualisationComponent(vis)}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ height: "100%", marginTop: "20px" }}>
                <h1><strong>Result Table</strong></h1>
                <div style={{ height: "90vh", padding: "1%", overflowY: "auto", }}>
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

export default Home;
