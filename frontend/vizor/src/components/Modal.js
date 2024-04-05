import React from 'react';
import BarChart from './charts/BarChart';
import PieChart from './charts/PieChart';
import ScatterChart from './charts/ScatterDiagram';
import MapClusteredPoints from './charts/MapClusteredPoints';

function Modal(props) {

  const { chartData, columns, type, onClose } = props;
  let chart;

  const fieldTypes = {
    categorical: [],
    numerical: [],
    date: []
  };

  console.log(columns)

  columns.forEach((col) => {
    switch (col.columnType) {
      case "varchar":
        fieldTypes.categorical.push(col.column.split(".")[1]);
        break;
      case "numeric":
        fieldTypes.numerical.push(col.column.split(".")[1]);
        break;
      case "int4":
        fieldTypes.numerical.push(col.column.split(".")[1]);
        break;
      case "int2":
        fieldTypes.numerical.push(col.column.split(".")[1]);
        break;
      case "date":
        fieldTypes.date.push(col.column.split(".")[1]);
        break;
      default:
        break;
    }
  });

  console.log(fieldTypes);
  switch (type) {
    case "Bar Chart":
      chart = <BarChart data={chartData} categoryField={fieldTypes.categorical[0]} valueField={fieldTypes.numerical[0]} />;
      break;
    case "Pie Chart":
      chart = <PieChart data={chartData} categoryField={fieldTypes.categorical[0]} valueField={fieldTypes.numerical[0]} />;
      break;
    case "Scatter Chart":
      chart = <ScatterChart data={chartData} valueXField={fieldTypes.numerical[0]} valueYField={fieldTypes.numerical[1]} />;
      break;
    case "Map With Clustered Points":
      chart = <MapClusteredPoints data={chartData} labelField={fieldTypes.categorical[0]} />;
    default:
      break;
  }


  return (
    <div className="modal-container">
      <div className="modal-content">
        <button className="btn red-btn" onClick={onClose}>CLOSE</button>
        {chart}
      </div>
    </div>
  );
}

export default Modal;