import "./App.css";
import {
  Input,
  Button,
  message,
  Row,
  Col,
  Space,
  TimePicker,
  Typography,
} from "antd";
import {
  ChromeOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import banner from "./banner.jpg";
import { useEffect, useState } from "react";

const { ipcRenderer } = window.electron;
const { Search, TextArea } = Input;
const { Text, Link } = Typography;

function App() {
  const [loading, setLoading] = useState(false);
  const [typeValue, setTypeValue] = useState([]);
  const [time, setTime] = useState("");
  const [chromeUrl, setChromeUrl] = useState(localStorage.getItem("chromeUrl"));
  useEffect(() => {
    function listenScreen(event, msg) {
      setLoading(false);
    }
    function listenShop(event, msg) {
      console.log("截图完成！");
      message.success(`${msg.shop}店铺截图完成！`);
      new Notification("截图完成！", { body: `${msg}店铺截图完成！` });
    }
    ipcRenderer.on("reply", listenScreen);
    ipcRenderer.on("successScreen", listenShop);
    return function clean() {
      ipcRenderer.off("reply", listenScreen);
      ipcRenderer.off("successScreen", listenShop);
    };
  });
  const StartBtn = function () {
    return (
      <>
        <ClockCircleOutlined /> 定时
      </>
    );
  };
  return (
    <div className="App">
      <Space direction="vertical">
        <Row>
          <Col>
            <img
              style={{
                WebkitAppRegion: "drag",
                borderRadius: "15px 15px 0 0",
              }}
              width="100%"
              src={banner}
            />
          </Col>
        </Row>
        <Row>
          <Col style={{ textAlign: "center" }} span={16} offset={4}>
            <Space>
              <Text strong type="secondary">
                准备定时于每天
              </Text>
              <TimePicker
                onChange={(time) => {
                  console.log(time);
                  setTime(time);
                }}
              />
              <Text strong type="secondary">
                开始自动截图
              </Text>
            </Space>
          </Col>
        </Row>
        <Row>
          <Col span={16} offset={4}>
            <TextArea
              className="textareaInput"
              spellCheck={false}
              resize="false"
              placeholder="请输入需要截图的店铺名称，回车换行分隔"
              rows={6}
              onChange={(event) => {
                let readArr = event.nativeEvent.target.value.split("\n");
                setTypeValue(readArr);
              }}
            />
          </Col>
        </Row>
        {/* <Row>
          <Col span={20} offset={4}>
            上次输入的浏览器地址：{chromeUrl}
          </Col>
        </Row> */}

        <Row>
          <Col span={13} offset={4}>
            <Search
              spellCheck={false}
              prefix={<ChromeOutlined />}
              defaultValue={chromeUrl}
              placeholder="请输入本机的chrome浏览器地址"
              enterButton={<StartBtn></StartBtn>}
              loading={loading}
              onChange={(event) => {
                setChromeUrl(event.target.value);
              }}
              onSearch={(value) => {
                localStorage.setItem("chromeUrl", value);
                console.log(value, typeValue, time);
                if (value && typeValue && time) {
                  setLoading(true);
                  ipcRenderer.send("screenshot", {
                    chromeUrl: value,
                    shopList: typeValue,
                    time: time._d,
                  });
                } else {
                  message.error("请检查表单是否提交完整！");
                }
              }}
            />
          </Col>
          <Col>
            <Button
              type="danger"
              onClick={() => {
                ipcRenderer.send("cancelJob", "");
                setLoading(false);
              }}
            >
              {<CloseCircleOutlined />}取消
            </Button>
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
      <div style={{ height: "25px" }}></div>
    </div>
  );
}

export default App;
