import React from 'react';
import Bar from './charts/basic/Bar';
import PieChart5 from './charts/PieChart5';
import Scatter from './charts/basic/Scatter';
import Choropleth5 from './charts/basic/Choropleth5';

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
      chart = <Bar data={chartData} categoryField={fieldTypes.categorical[0]} valueField={fieldTypes.numerical[0]} />;
      break;
    case "Pie Chart":
      chart = <PieChart5 data={chartData} categoryField={fieldTypes.categorical[0]} valueField={fieldTypes.numerical[0]} />;
      break;
    case "Scatter Chart":
      chart = <Scatter data={chartData} valueXField={fieldTypes.numerical[0]} valueYField={fieldTypes.numerical[1]} />;
      break;
    case "Map With Clustered Points":
      chart = <Choropleth5 data={chartData} labelField={fieldTypes.categorical[0]} />;
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