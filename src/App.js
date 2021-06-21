import "./App.css";
import { Input, Button, Row, Col, Space, TimePicker, Typography } from "antd";
import banner from "./banner.jpg";
import { useEffect, useState } from "react";
const { ipcRenderer } = window.electron;
const { Search } = Input;
const { Text, Link } = Typography;

function App() {
  const [loading, setLoading] = useState(false);
  const [typeValue, setTypeValue] = useState([]);
  useEffect(() => {
    function listenScreen(event, msg) {
      setLoading(false);
    }
    ipcRenderer.on("reply", listenScreen);
    return function clean() {
      ipcRenderer.off("reply", listenScreen);
    };
  });
  return (
    <div className="App">
      <Space direction="vertical">
        <Row>
          <Col>
            <img
              style={{
                "-webkit-app-region": "drag",
              }}
              width="100%"
              src={banner}
            />
          </Col>
        </Row>
        <Row>
          <Col  style={{ textAlign: "center" }} span={16} offset={4}>
            <Space>
            <Text strong type="success">准备定时于每天</Text>
            <TimePicker
              onChange={(time) => {
                console.log(time);
              }}
            />
            <Text strong type="success">开始自动截图</Text>
            </Space>
          </Col>
        </Row>
        <Row>
          <Col span={16} offset={4}>
            <Search
              placeholder="请输入本地电脑的chrome执行路径"
              enterButton="开始截图"
              loading={loading}
              onSearch={(value) => {
                setLoading(true);
                ipcRenderer.send("screenshot", {
                  chromeUrl: value,
                  shopList: typeValue,
                });
              }}
            />
          </Col>
        </Row>
        <Row>
          <Col style={{ textAlign: "center" }} span={16} offset={4}>
            <Space>
              <Button
                type="primary"
                onClick={() => {
                  ipcRenderer.send("hide", "");
                }}
              >
                后台运行
              </Button>
              <Button
                type="danger"
                onClick={() => {
                  ipcRenderer.send("close", "");
                }}
              >
                彻底退出
              </Button>
            </Space>
          </Col>
        </Row>
      </Space>
    </div>
  );
}

export default App;
