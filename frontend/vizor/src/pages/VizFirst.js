import React, { useState, useEffect } from "react";
import { Avatar, Checkbox, Flex, Layout, Menu, Spin, Tooltip, Modal, InputNumber, Input, Select } from 'antd';
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
import HierarchyTree5 from "../components/charts/onemany/HierarchyTree5";
import NetworkChart from "../components/charts/manymany/NetworkChart";

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
    },
    {
      id: "network",
      name: "Network Chart",
      pattern: "many-many",
      image: "network.png"
    },
  ];

  const [selectedChartType, setSelectedChartType] = useState("");
  const [tableMetadata, setTableMetadata] = useState([]);
  const [shownTables, setShownTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [pattern, setPattern] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [graph, setGraph] = useState(null);
  // const [chartData, setChartData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedKey1, setSelectedKey1] = useState("-");
  const [selectedKey2, setSelectedKey2] = useState("-");
  const [selectedAtt1, setSelectedAtt1] = useState("-");
  const [selectedAtt2, setSelectedAtt2] = useState("-");
  const [selectedAtt3, setSelectedAtt3] = useState("-");
  const [filters, setFilters] = useState({});
  const [limit, setLimit] = useState("");

  const pages = new Array(3).fill(null).map((_, index) => ({
    key: index + 1,
    label: index === 0 ? (<a href="/">CONNECT</a>) : index === 1 ? (<a href="/data-first">DATA-FIRST</a>) : (<a href="/viz-first">VIZ-FIRST</a>),
  }));

  useEffect(() => {

    async function fetchTableMetadata() {
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/v1/tables/`, {
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
      if (shownTables.length === 0) {
        setShownTables(data.map((table) => table.tableName));
      }

      console.log("Table Metadata:");
      console.log(data)
    }

    fetchTableMetadata();
  }, []);

  const handleSelectChartType = async (id) => {

    setResults([]);
    setSelectedKey1("-");
    setSelectedKey2("-");
    setSelectedAtt1("-");
    setSelectedAtt2("-");
    setSelectedAtt3("-");

    const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/v1/vf-select/`, {
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

    setSelectedKey1("-");
    setSelectedKey2("-");
    setSelectedAtt1("-");
    setSelectedAtt2("-");
    setSelectedAtt3("-");
    setFilters({});
    setLimit("");
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

    const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/v1/vf-generate/`, {
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

  const handleSelectKey1 = (key) => {
    addFilter(key, selectedKey1);
    setSelectedKey1(key);
  };

  const handleSelectKey2 = (key) => {
    addFilter(key, selectedKey2);
    setSelectedKey2(key);
  };

  const handleSelectAtt1 = (att) => {
    addFilter(att, selectedAtt1);
    setSelectedAtt1(att);
  };

  const handleSelectAtt2 = (att) => {
    addFilter(att, selectedAtt2);
    setSelectedAtt2(att);
  };

  const handleSelectAtt3 = (att) => {
    addFilter(att, selectedAtt3);
    setSelectedAtt3(att);
  };

  const addFilter = (newColumnName, oldColumnName) => {

    let fullColumnName = selectedTable + "." + oldColumnName;

    const updatedFilters = { ...filters };
    delete updatedFilters[fullColumnName];
    setFilters(updatedFilters);

    if (newColumnName === "-") {
      return;
    }

    fullColumnName = selectedTable + "." + newColumnName;

    const columnObj = tableMetadata.find((table) => table.tableName === selectedTable).columns.find((column) => column.name === newColumnName);

    const isNumericType = ['int2', 'int4', 'int8', 'float4', 'float8', 'numeric'].includes(columnObj.type);
    const isLexicalType = ['varchar', 'text', 'char', 'bpchar'].includes(columnObj.type);

    if (isNumericType || isLexicalType) {
      setFilters(prevFilters => ({ ...prevFilters, [fullColumnName]: { comparator: "=", value: "", type: isNumericType ? "num" : "lex" } }));
    }
  };

  const handleFilterComparatorChange = (fullColumnName, comparator) => {
    setFilters(prevFilters => ({ ...prevFilters, [fullColumnName]: { ...prevFilters[fullColumnName], comparator } }));
  };

  const handleFilterValueChange = (fullColumnName, value) => {
    setFilters(prevFilters => ({ ...prevFilters, [fullColumnName]: { ...prevFilters[fullColumnName], value } }));
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
      <Select defaultValue="=" style={{ width: "100px" }} onChange={(comp) => handleFilterComparatorChange(fullColumnName, comp)}>
        <Select.Option value="=">{"="}</Select.Option>
        <Select.Option value="!=">{"!="}</Select.Option>
        <Select.Option value="LIKE">{"LIKE"}</Select.Option>
        <Select.Option value="NOT LIKE">{"NOT LIKE"}</Select.Option>
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

  const generateVisResultsComponent = (vis) => {

    if (selectedKey1 && selectedKey1 !== "-" && vis.key1 !== selectedKey1) {
      return null;
    }

    if (selectedKey2 && selectedKey2 !== "-" && vis.key2 !== selectedKey2) {
      return null;
    }

    if (selectedAtt1 && selectedAtt1 !== "-" && vis.attributes[0] !== selectedAtt1) {
      return null;
    }

    if (selectedAtt2 && selectedAtt2 !== "-" && vis.attributes[1] !== selectedAtt2) {
      return null;
    }

    if (selectedAtt3 && selectedAtt3 !== "-" && vis.attributes[2] !== selectedAtt3) {
      return null;
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

    const key1 = vis.key1;
    const key2 = vis.key2;
    const attributes = vis.attributes;

    const keys = [key1, key2];

    const formData = {
      pattern,
      tables: [selectedTable],
      columns: [],
      filters: usedFilters,
      limit: limit === "" ? -1 : parseInt(limit)
    };

    if (vis.key2) {
      formData.columns.push(...key1.split(" | "));
      formData.columns.push(key2);
      formData.columns.push(...attributes);
    } else {
      formData.columns.push(key1);
      formData.columns.push(...attributes);
    }

    const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/v1/vf-execute/`, {
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
    // setChartData(data);

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
        setGraph(<Calendar data={data} categoryField={key1} valueField={attributes[0]} />);
        break;
      case "hierarchy-tree":
        setGraph(<HierarchyTree5 data={data} categoryFields={keys} />);
        break;
      case "network":
        setGraph(<NetworkChart data={data} categoryFields={keys} />);
        break;
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

  const generateColumnOptionComponent = () => {
    const key1s = ["-"];

    results.forEach((res) => {
      if (!key1s.includes(res.key1)) {
        key1s.push(res.key1);
      }
    });

    const key2s = ["-"];

    results.forEach((res) => {
      if (res.key2 && !key2s.includes(res.key2)) {
        key2s.push(res.key2);
      }
    });

    const attributes = ["-"];

    results.forEach((res) => {
      res.attributes.forEach((attr) => {
        if (!attributes.includes(attr)) {
          attributes.push(attr);
        }
      });
    });

    console.log("Selected Chart Type:" + selectedChartType);
    console.log("Key 1s:" + key1s);
    console.log("Key 2s:" + key2s);
    console.log("Attributes:" + attributes);

    switch (selectedChartType) {
      case "bar":
        return (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", paddingBottom: "10px", gap: "10px" }}>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-end", justifyContent: "center", width: "100%", gap: "10px" }}>
              <h3><strong>Key 1 (X-Axis): </strong></h3>
              <Select defaultValue="-" style={{ width: "50%" }} onChange={(key) => handleSelectKey1(key)}>
                {key1s.map((key, index) => (
                  <Select.Option key={index} value={key}>{key}</Select.Option>
                ))}
              </Select>
            </div>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-end", justifyContent: "center", width: "100%", gap: "10px" }}>
              <h3><strong>Attribute 1 (Y-Axis): </strong></h3>
              <Select defaultValue="-" style={{ width: "50%" }} onChange={(att) => handleSelectAtt1(att)}>
                {attributes.map((att, index) => (
                  <Select.Option key={index} value={att}>{att}</Select.Option>
                ))}
              </Select>
            </div>
          </div>
        );
      case "bubble":
        return (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", paddingBottom: "10px", gap: "10px" }}>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-end", justifyContent: "center", width: "100%", gap: "10px" }}>
              <h3><strong>Attribute 1 (X-Axis): </strong></h3>
              <Select defaultValue="-" style={{ width: "50%" }} onChange={(key) => handleSelectAtt1(key)}>
                {attributes.filter((att) => att === "-" ? true : selectedAtt2 !== att && selectedAtt3 !== att).map((key, index) => (
                  <Select.Option key={index} value={key}>{key}</Select.Option>
                ))}
              </Select>
            </div>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-end", justifyContent: "center", width: "100%", gap: "10px" }}>
              <h3><strong>Attribute 2 (Y-Axis): </strong></h3>
              <Select defaultValue="-" style={{ width: "50%" }} onChange={(att) => handleSelectAtt2(att)}>
                {attributes.filter((att) => att === "-" ? true : selectedAtt1 !== att && selectedAtt3 !== att).map((att, index) => (
                  <Select.Option key={index} value={att}>{att}</Select.Option>
                ))}
              </Select>
            </div>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-end", justifyContent: "center", width: "100%", gap: "10px" }}>
              <h3><strong>Attribute 3 (Size): </strong></h3>
              <Select defaultValue="-" style={{ width: "50%" }} onChange={(att) => handleSelectAtt3(att)}>
                {attributes.filter((att) => att === "-" ? true : selectedAtt1 !== att && selectedAtt2 !== att).map((att, index) => (
                  <Select.Option key={index} value={att}>{att}</Select.Option>
                ))}
              </Select>
            </div>
          </div>
        );
      case "calendar":
        return (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", paddingBottom: "10px", gap: "10px" }}>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-end", justifyContent: "center", width: "100%", gap: "10px" }}>
              <h3><strong>Attribute 1 (Date): </strong></h3>
              <Select defaultValue="-" style={{ width: "50%" }} onChange={(att) => handleSelectAtt1(att)}>
                {attributes.map((att, index) => (
                  <Select.Option key={index} value={att}>{att}</Select.Option>
                ))}
              </Select>
            </div>
          </div>
        );
      case "choropleth":
        return (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", paddingBottom: "10px", gap: "10px" }}>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-end", justifyContent: "center", width: "100%", gap: "10px" }}>
              <h3><strong>Attribute 1 (Value): </strong></h3>
              <Select defaultValue="-" style={{ width: "50%" }} onChange={(att) => handleSelectAtt1(att)}>
                {attributes.map((att, index) => (
                  <Select.Option key={index} value={att}>{att}</Select.Option>
                ))}
              </Select>
            </div>
          </div>
        );
      case "scatter":
        return (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", paddingBottom: "10px", gap: "10px" }}>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-end", justifyContent: "center", width: "100%", gap: "10px" }}>
              <h3><strong>Attribute 1 (X-Axis): </strong></h3>
              <Select defaultValue="-" style={{ width: "50%" }} onChange={(att) => handleSelectAtt1(att)}>
                {attributes.filter((att) => att === "-" ? true : selectedAtt2 !== att).map((key, index) => (
                  <Select.Option key={index} value={key}>{key}</Select.Option>
                ))}
              </Select>
            </div>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-end", justifyContent: "center", width: "100%", gap: "10px" }}>
              <h3><strong>Attribute 2 (Y-Axis): </strong></h3>
              <Select defaultValue="-" style={{ width: "50%" }} onChange={(att) => handleSelectAtt2(att)}>
                {attributes.filter((att) => att === "-" ? true : selectedAtt1 !== att).map((att, index) => (
                  <Select.Option key={index} value={att}>{att}</Select.Option>
                ))}
              </Select>
            </div>
          </div>
        );
      case "word-cloud":
        return (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", paddingBottom: "10px", gap: "10px" }}>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-end", justifyContent: "center", width: "100%", gap: "10px" }}>
              <h3><strong>Attribute 1 (Size): </strong></h3>
              <Select defaultValue="-" style={{ width: "50%" }} onChange={(att) => handleSelectAtt1(att)}>
                {attributes.map((att, index) => (
                  <Select.Option key={index} value={att}>{att}</Select.Option>
                ))}
              </Select>
            </div>
          </div>
        );
      case "line":
        return (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", paddingBottom: "10px", gap: "10px" }}>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-end", justifyContent: "center", width: "100%", gap: "10px" }}>
              <h3><strong>Key 1 (Line): </strong></h3>
              <Select defaultValue="-" style={{ width: "50%" }} onChange={(key) => handleSelectKey1(key)}>
                {key1s.map((key, index) => (
                  <Select.Option key={index} value={key}>{key}</Select.Option>
                ))}
              </Select>
            </div>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-end", justifyContent: "center", width: "100%", gap: "10px" }}>
              <h3><strong>Key 2 (X-Axis): </strong></h3>
              <Select defaultValue="-" style={{ width: "50%" }} onChange={(key) => handleSelectKey2(key)}>
                {key2s.map((key, index) => (
                  <Select.Option key={index} value={key}>{key}</Select.Option>
                ))}
              </Select>
            </div>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-end", justifyContent: "center", width: "100%", gap: "10px" }}>
              <h3><strong>Attribute 1 (Y-Axis): </strong></h3>
              <Select defaultValue="-" style={{ width: "50%" }} onChange={(att) => handleSelectAtt1(att)}>
                {attributes.map((att, index) => (
                  <Select.Option key={index} value={att}>{att}</Select.Option>
                ))}
              </Select>
            </div>
          </div>
        );
      case "grouped-bar":
      case "stacked-bar":
        return (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", paddingBottom: "10px", gap: "10px" }}>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-end", justifyContent: "center", width: "100%", gap: "10px" }}>
              <h3><strong>Key 1 (Group): </strong></h3>
              <Select defaultValue="-" style={{ width: "50%" }} onChange={(key) => handleSelectKey1(key)}>
                {key1s.map((key, index) => (
                  <Select.Option key={index} value={key}>{key}</Select.Option>
                ))}
              </Select>
            </div>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-end", justifyContent: "center", width: "100%", gap: "10px" }}>
              <h3><strong>Key 2 (X-Axis): </strong></h3>
              <Select defaultValue="-" style={{ width: "50%" }} onChange={(key) => handleSelectKey2(key)}>
                {key2s.map((key, index) => (
                  <Select.Option key={index} value={key}>{key}</Select.Option>
                ))}
              </Select>
            </div>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-end", justifyContent: "center", width: "100%", gap: "10px" }}>
              <h3><strong>Attribute 1 (Y-Axis): </strong></h3>
              <Select defaultValue="-" style={{ width: "50%" }} onChange={(att) => handleSelectAtt1(att)}>
                {attributes.map((att, index) => (
                  <Select.Option key={index} value={att}>{att}</Select.Option>
                ))}
              </Select>
            </div>
          </div>
        );
      case "spider":
        return (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", paddingBottom: "10px", gap: "10px" }}>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-end", justifyContent: "center", width: "100%", gap: "10px" }}>
              <h3><strong>Key 1 (Ring): </strong></h3>
              <Select defaultValue="-" style={{ width: "50%" }} onChange={(key) => handleSelectKey1(key)}>
                {key1s.map((key, index) => (
                  <Select.Option key={index} value={key}>{key}</Select.Option>
                ))}
              </Select>
            </div>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-end", justifyContent: "center", width: "100%", gap: "10px" }}>
              <h3><strong>Key 2 (Spoke): </strong></h3>
              <Select defaultValue="-" style={{ width: "50%" }} onChange={(key) => handleSelectKey2(key)}>
                {key2s.map((key, index) => (
                  <Select.Option key={index} value={key}>{key}</Select.Option>
                ))}
              </Select>
            </div>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-end", justifyContent: "center", width: "100%", gap: "10px" }}>
              <h3><strong>Attribute 1 (Value): </strong></h3>
              <Select defaultValue="-" style={{ width: "50%" }} onChange={(att) => handleSelectAtt1(att)}>
                {attributes.map((att, index) => (
                  <Select.Option key={index} value={att}>{att}</Select.Option>
                ))}
              </Select>
            </div>
          </div>
        );
      case "circle-packing":
        return (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", paddingBottom: "10px", gap: "10px" }}>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-end", justifyContent: "center", width: "100%", gap: "10px" }}>
              <h3><strong>Key 1 (Group): </strong></h3>
              <Select defaultValue="-" style={{ width: "50%" }} onChange={(key) => handleSelectKey1(key)}>
                {key1s.map((key, index) => (
                  <Select.Option key={index} value={key}>{key}</Select.Option>
                ))}
              </Select>
            </div>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-end", justifyContent: "center", width: "100%", gap: "10px" }}>
              <h3><strong>Key 2 (Circle): </strong></h3>
              <Select defaultValue="-" style={{ width: "50%" }} onChange={(key) => handleSelectKey2(key)}>
                {key2s.map((key, index) => (
                  <Select.Option key={index} value={key}>{key}</Select.Option>
                ))}
              </Select>
            </div>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-end", justifyContent: "center", width: "100%", gap: "10px" }}>
              <h3><strong>Attribute 1 (Size): </strong></h3>
              <Select defaultValue="-" style={{ width: "50%" }} onChange={(att) => handleSelectAtt1(att)}>
                {attributes.map((att, index) => (
                  <Select.Option key={index} value={att}>{att}</Select.Option>
                ))}
              </Select>
            </div>
          </div>
        );
      case "hierarchy-tree":
        return (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", paddingBottom: "10px", gap: "10px" }}>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-end", justifyContent: "center", width: "100%", gap: "10px" }}>
              <h3><strong>Key 1 (Node): </strong></h3>
              <Select defaultValue="-" style={{ width: "50%" }} onChange={(key) => handleSelectKey1(key)}>
                {key1s.map((key, index) => (
                  <Select.Option key={index} value={key}>{key}</Select.Option>
                ))}
              </Select>
            </div>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-end", justifyContent: "center", width: "100%", gap: "10px" }}>
              <h3><strong>Key 2 (Child): </strong></h3>
              <Select defaultValue="-" style={{ width: "50%" }} onChange={(key) => handleSelectKey2(key)}>
                {key2s.map((key, index) => (
                  <Select.Option key={index} value={key}>{key}</Select.Option>
                ))}
              </Select>
            </div>
          </div>
        );
      case "treemap":
        return (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", paddingBottom: "10px", gap: "10px" }}>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-end", justifyContent: "center", width: "100%", gap: "10px" }}>
              <h3><strong>Key 1 (Group): </strong></h3>
              <Select defaultValue="-" style={{ width: "50%" }} onChange={(key) => handleSelectKey1(key)}>
                {key1s.map((key, index) => (
                  <Select.Option key={index} value={key}>{key}</Select.Option>
                ))}
              </Select>
            </div>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-end", justifyContent: "center", width: "100%", gap: "10px" }}>
              <h3><strong>Key 2 (Child): </strong></h3>
              <Select defaultValue="-" style={{ width: "50%" }} onChange={(key) => handleSelectKey2(key)}>
                {key2s.map((key, index) => (
                  <Select.Option key={index} value={key}>{key}</Select.Option>
                ))}
              </Select>
            </div>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-end", justifyContent: "center", width: "100%", gap: "10px" }}>
              <h3><strong>Attribute 1 (Size): </strong></h3>
              <Select defaultValue="-" style={{ width: "50%" }} onChange={(att) => handleSelectAtt1(att)}>
                {attributes.map((att, index) => (
                  <Select.Option key={index} value={att}>{att}</Select.Option>
                ))}
              </Select>
            </div>
          </div>
        );
      case "chord":
      case "sankey":
        return (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", paddingBottom: "10px", gap: "10px" }}>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-end", justifyContent: "center", width: "100%", gap: "10px" }}>
              <h3><strong>Key 1 (Start): </strong></h3>
              <Select defaultValue="-" style={{ width: "50%" }} onChange={(key) => handleSelectKey1(key)}>
                {key1s.map((key, index) => (
                  <Select.Option key={index} value={key}>{key}</Select.Option>
                ))}
              </Select>
            </div>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-end", justifyContent: "center", width: "100%", gap: "10px" }}>
              <h3><strong>Key 2 (End): </strong></h3>
              <Select defaultValue="-" style={{ width: "50%" }} onChange={(key) => handleSelectKey2(key)}>
                {key2s.map((key, index) => (
                  <Select.Option key={index} value={key}>{key}</Select.Option>
                ))}
              </Select>
            </div>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-end", justifyContent: "center", width: "100%", gap: "10px" }}>
              <h3><strong>Attribute 1 (Size): </strong></h3>
              <Select defaultValue="-" style={{ width: "50%" }} onChange={(att) => handleSelectAtt1(att)}>
                {attributes.map((att, index) => (
                  <Select.Option key={index} value={att}>{att}</Select.Option>
                ))}
              </Select>
            </div>
          </div>
        );
      default:
        return;
    }
  };

  const clearOutput = () => {
    setShownTables(tableMetadata.map((table) => table.tableName));
    setPattern("");
    setResults([]);
    setLoading(false);
    setSelectedChartType("");
    setSelectedTable("");
    // setChartData([]);
    setGraph(null);
    setSelectedKey1("-");
    setSelectedKey2("-");
    setSelectedAtt1("-");
    setSelectedAtt2("-");
    setSelectedAtt3("-");
    setFilters({});
    setLimit("");
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
            defaultSelectedKeys={['3']}
            items={pages}
            style={{ flex: 1, minWidth: 0 }}
          />
        </Header>
        <Content>
          <div style={{ display: "flex", height: "95vh", width: "100%", backgroundColor: "#001529", justifyContent: "center" }}>
            <Flex align="flex-start" gap="small" style={{ backgroundColor: "#fff", width: "98%", height: "95%", borderRadius: "5px" }}>
              <div style={{ minWidth: "20vw", maxWidth: "20vw", height: "100%", padding: "1%", justifyContent: "center" }}>
                <div style={{ display: "flex", paddingTop: "10px", justifyContent: "center" }}>
                  <h2><strong>Visualisation Types</strong></h2>
                </div>
                <div style={{ height: "95%", overflowY: "auto", paddingRight: "2%" }}>
                  {chartTypes.map((vis) => (
                    <div key={vis.id}>
                      {generateVisOptionComponent(vis)}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ minWidth: "20vw", maxWidth: "20vw", height: "100%", padding: "1%", justifyContent: "center" }}>
                <div style={{ display: "flex", paddingTop: "10px", justifyContent: "center" }}>
                  <h2><strong>Tables</strong></h2>
                </div>
                <div style={{ height: "95%", overflowY: "auto", paddingRight: "2%" }}>
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
              </div>

              <div style={{ minWidth: "20vw", maxWidth: "20vw", height: "100%", overflowY: "auto", padding: "1%", marginRight: "20px" }}>
                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", marginBottom: "10px", marginTop: "10px" }}>
                  <button style={{ marginRight: "5px", width: "50%" }} className="btn" onClick={handleRenderButtonClick}>GENERATE</button>
                  <button style={{ width: "50%" }} className="btn red-btn" onClick={clearOutput}>CLEAR</button>
                </div>
                <Spin spinning={loading}>
                  <div style={{ marginBottom: "10px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <h2 style={{ marginBottom: "10px" }}><strong>Pattern Detected</strong></h2>
                    {generatePatternComponent(pattern)}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderTop: "1px solid #ccc", paddingTop: "10px" }}>
                    <h2 style={{ marginBottom: "10px" }}><strong>Column Options</strong></h2>
                    {results.length > 0 && generateColumnOptionComponent()}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", borderTop: "1px solid #ccc", paddingTop: "10px" }}>
                    <h2><strong>Filters</strong></h2>
                    {filters && Object.keys(filters).map((fullColumnName, index) => (
                      <div key={index} style={{ width: "100%" }}>
                        {generateFilterComponent(fullColumnName, filters[fullColumnName])}
                      </div>
                    ))}
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
                </Spin>
              </div>

              <div style={{ display: "flex", flexDirection: "column", marginTop: "30px", alignItems: "center", width: "100%", paddingRight: "1%", height: "95%", overflowY: "auto" }}>
                <h2><strong>Visualisation Options</strong></h2>
                <div style={{ height: "95%", width: "100%", overflowY: "auto", paddingRight: "2%" }}>
                  <p>NUMBER OF OPTIONS: {results.length}</p>
                  {results.length > 0 && results.map((res, index) => (
                    <div key={index} >
                      {generateVisResultsComponent(res)}
                    </div>
                  ))}
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