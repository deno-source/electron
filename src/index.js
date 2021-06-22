import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import {
  ConfigProvider
} from "antd";
import App from "./App";
import zhCN from 'antd/lib/locale/zh_CN';

ReactDOM.render(<ConfigProvider locale={zhCN}>
  <React.StrictMode>
    <App />
  </React.StrictMode></ConfigProvider>,
  document.getElementById("root")
);

