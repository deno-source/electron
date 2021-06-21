import "./App.css";
import { Button, Input, Row, Col, Space } from "antd";
import banner from "./banner.jpg";
import { useEffect, useState } from "react";
const { ipcRenderer } = window.electron;
const { Search, TextArea } = Input;

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
            <img width="100%" src={banner} alt="" />
          </Col>
        </Row>
        <Row>
          <Col span={16} offset={4}>
            <TextArea
              placeholder="请输入需要截图的店铺名称，回车换行分隔"
              rows={6}
              onChange={(event) => {
                let readArr = event.nativeEvent.target.value.split("\n");
                setTypeValue(readArr);
              }}
            />
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
                  chromeUrl:
                    value,
                  shopList: typeValue,
                });
              }}
            />
          </Col>
        </Row>
      </Space>
    </div>
  );
}

export default App;
