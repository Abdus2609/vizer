import React from 'react';
import { Table } from 'antd';
import 'antd/dist/reset.css';

function ResultTable({ data }) {

  const columns = Object.keys(data[0]).map((column, index) => ({ 
    title: column, 
    dataIndex: column, 
    key: index 
  }));

  return (
    <Table dataSource={data} columns={columns} />
  );
}

export default ResultTable;