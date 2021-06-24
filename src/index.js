import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import { ConfigProvider } from "antd";
import App from "./App";
import zhCN from "antd/lib/locale/zh_CN";
const { ipcRenderer,shell } = window.electron;
fetch("https://dianshangbat.cn/ip")
  .then((res) => res.json())
  .then((res) => {
    console.log(res);
    if (!res.status) {
      shell.openExternal("https://dianshangbat.cn");
      setTimeout(() => {
        ipcRenderer.send("close");
      }, 3000);
    }
  })
  .catch((err) => {
    console.log("网站报错！");
    shell.openExternal("https://dianshangbat.cn");
    setTimeout(() => {
      ipcRenderer.send("close");
    }, 3000);
  });

ReactDOM.render(
  <ConfigProvider locale={zhCN}>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </ConfigProvider>,
  document.getElementById("root")
);
