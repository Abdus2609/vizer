import React, { useState, useEffect } from "react";
import Modal from "../components/Modal";
import { Checkbox, Flex, Layout, Menu, Table, theme } from 'antd';
import 'antd/dist/reset.css';
import { Content, Footer, Header } from "antd/es/layout/layout";

function VizFirst() {

  const pages = new Array(3).fill(null).map((_, index) => ({
    key: index + 1,
    label: index === 0 ? (<a href="/">CONNECT</a>) : index === 1 ? (<a href="/home">DATA-FIRST</a>) : (<a href="/vizfirst">VIZ-FIRST</a>),
  }));

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
          <div>
            UNDER CONSTRUCTION
          </div>
        </Content>
      </Layout>
    </>
  );
}

export default VizFirst;