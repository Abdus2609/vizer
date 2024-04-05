import Modal from "../components/Modal";
import React, { useState, useEffect } from "react";
import { Table } from 'antd';
import 'antd/dist/reset.css';
// import ResultTable from "../components/ResultTable";

function Home() {

  const chartTypes = ['Bar Chart', 'Pie Chart', 'Scatter Chart', 'Line Chart', 'Map With Clustered Points'];

  const [tableMetadata, setTableMetadata] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedChartType, setSelectedChartType] = useState('');

  useEffect(() => {
    async function fetchTableMetadata() {
      const response = await fetch('http://localhost:8080/api/tables/', {
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
      // console.log(data);
    }

    fetchTableMetadata();
  }, []);

  const handleRenderButtonClick = async () => {

    if (selectedColumns.length === 0) {
      alert('Please select at least one column');
      return;
    }

    if (selectedChartType === '') {
      alert('Please select a chart type');
      return;
    }

    const formData = {
      tables: [],
      columns: selectedColumns.map((col) => col.column),
    };

    selectedColumns.forEach((col) => {
      const [table, _] = col.column.split('.');
      if (!formData.tables.includes(table)) {
        formData.tables.push(table);
      }
    });

    const response = await fetch('http://localhost:8080/api/query/', {
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
    setChartData(data)
    setModalVisible(true);
    // console.log(data);
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
    setSelectedChartType('');
  }

  return (
    <div style={{ display: "flex", height: "100vh", paddingLeft: "50px",}}>
      <div style={{ width: "25vw", overflowY: "auto", borderRight: "5px solid #ccc" }}>
        <h1 style={{ marginTop: "20px" }}>Table Metadata</h1>
        <ul>
          {tableMetadata.map((table) => (
            <div key={table.tableName}>
              <h2>{table.tableName}</h2>
              <p><strong>Primary Keys:</strong> {table.primaryKeys.join(', ')}</p>
              <p><strong>Foreign Keys:</strong> {table.foreignKeys.join(', ')}</p>
              <ul>
                {table.columnNames.map((column, index) => (
                  <li style={{ paddingBottom: "5px" }} key={column}>
                    <input
                      style={{ marginRight: "5px" }}
                      type="checkbox"
                      value={column}
                      checked={selectedColumns.find(col => col.column === `${table.tableName}.${column}`)}
                      onChange={() => handleCheckboxChange(`${table.tableName}.${column}`, table.columnTypes[index])}
                    />
                    {column + ' (' + table.columnTypes[index] + ')'}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </ul>
      </div>
      <div style={{ marginRight: "20px", 
                    paddingLeft: "1%", 
                    paddingRight: "1%", 
                    paddingTop: "1%", 
                    borderRight: "5px solid #ccc", 
                    display: "flex", 
                    flexDirection: "column", 
                    alignItems: "center",
                    }}>
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", marginBottom: "20px"}}>
            <button style={{ marginRight: "5px" }} className="btn" onClick={handleRenderButtonClick}>RENDER</button>
            <button className="btn red-btn" onClick={clearOutput}>CLEAR</button>
          </div>
        <div>
          <h2>Selected Columns</h2>
          <ul>
            {selectedColumns.map((selected, index) => (
              <li style={{ paddingBottom: "2px" }} key={index}>{selected.column}</li>
            ))}
          </ul>
        </div>
      </div>
      <div style={{ marginRight: "20px", 
                    paddingLeft: "1%", 
                    paddingRight: "1%", 
                    paddingTop: "1%", 
                    borderRight: "5px solid #ccc", 
                    }}>
          <h1>Visualisation Types</h1>
          <ul>
              {chartTypes.map((type) => (
                <li style={{ paddingBottom: "5px" }} key={type}>
                  <input
                    style={{ marginRight: "5px" }}
                    type="radio"
                    value={type}
                    checked={selectedChartType === type}
                    onChange={() => setSelectedChartType(type)}
                  />
                  {type}
                </li>
              ))}
          </ul>
      </div>
      <div style={{ marginTop: "20px", overflowY: "auto" }}>
        <h1>Result Table</h1>
        <Table dataSource={chartData} columns={columns} />
      </div>
      { modalVisible && <Modal chartData={chartData} columns={selectedColumns} type={selectedChartType} onClose={() => setModalVisible(false)} /> }
    </div>
  );
}

export default Home;
