import "./App.css";
import {
  Input,
  Button,
  message,
  Row,
  Col,
  Progress,
  Space,
  TimePicker,
  Typography,
  Descriptions,
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
  const [percent, setPercent] = useState(0);
  const [desc, setDesc] = useState("等待操作");
  const [time, setTime] = useState("");
  const [nowShop, setNowShop] = useState("等待下一个店铺");
  const [chromeUrl, setChromeUrl] = useState(localStorage.getItem("chromeUrl"));
  useEffect(() => {
    function listenScreen(event, msg) {
      message.error(msg);
      setLoading(false);
    }

    function listenProgress(event, msg) {
      setDesc(msg.desc);
      setPercent(msg.progress);
      setNowShop(msg.shop);
    }

    function listenShop(event, msg) {
      console.log("截图完成！");
      setDesc("等待操作");
      setPercent(0);
      setNowShop("等待下一个店铺");
      message.success(`${msg.shop} 店铺截图完成！`);
      new Notification("截图完成！", { body: `${msg.shop}店铺截图完成！` });
    }
    ipcRenderer.on("reply", listenScreen);
    ipcRenderer.on("progress", listenProgress);
    ipcRenderer.on("successScreen", listenShop);
    return function clean() {
      ipcRenderer.off("reply", listenScreen);
      ipcRenderer.off("progress", listenProgress);
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
                disabled={loading}
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
          <Col span={6} offset={4}>
            <TextArea
              className="textareaInput"
              spellCheck={false}
              resize="false"
              placeholder="请输入需要截图的店铺名称，回车换行分隔"
              rows={6}
              disabled={loading}
              onChange={(event) => {
                let readArr = event.nativeEvent.target.value.split("\n");
                setTypeValue(readArr);
              }}
            />
          </Col>
          <Col span={2} offset={1}>
            <Progress type="circle" percent={percent} />
          </Col>
          <Col className="tips" span={4} offset={3}>
            <div>
            <Text type="success">{nowShop}</Text><br />
            <Text type="success">{desc}</Text>
           </div>
          </Col>
        </Row>

        <Row>
          <Col span={13} offset={4}>
            <Search
              spellCheck={false}
              prefix={<ChromeOutlined />}
              defaultValue={chromeUrl}
              placeholder="请输入本机谷歌浏览器地址"
              enterButton={<StartBtn> </StartBtn>}
              loading={loading}
              disabled={loading}
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
              {<CloseCircleOutlined />}
              取消
            </Button>
          </Col>
        </Row>
        <Row>
          <Col style={{ textAlign: "center" }} span={16} offset={4}>
            <Space>
              <Button
                type="primary"
                onClick={() => {
                  ipcRenderer.send("getpath", "");
                }}
              >
                打开截图目录
              </Button>
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
      <div style={{ height: "25px" }}> </div>
    </div>
  );
}

export default App;
