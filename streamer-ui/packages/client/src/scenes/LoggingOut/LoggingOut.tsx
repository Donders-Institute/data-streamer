import React from "react";

import {
    Card,
    Layout,
    Row,
    Col,
    Typography
} from "antd";

import HeaderLandingPage from "../../components/HeaderLandingPage/HeaderLandingPage";

import "../../app/App.less";
import logoDCCN from "../../assets/dccn-logo.png";

const { Content } = Layout;

const LoggingOut: React.FC = () => {
    return (
        <React.Fragment>
            <HeaderLandingPage />
            <Content className="Login">
                <Row type="flex" justify="center" align="middle" style={{ width: "100%" }}>
                    <Col span={2}></Col>
                    <Col span={20}>
                        <Card className="LoginCard">
                            <div style={{ display: "flex", justifyContent: "center", margin: "0px 0px 20px 0px" }}>
                                <img alt="Donders Institute" src={logoDCCN} height={64} />
                            </div>
                            <h2 style={{ display: "flex", justifyContent: "center", margin: "0px 0px 10px 0px" }}>
                                Research Data Uploader
                            </h2>
                            <div style={{ margin: "0px 0px 10px 0px" }}>
                                <Typography.Text type="danger">Logging out ...</Typography.Text>
                            </div>
                        </Card>
                    </Col>
                    <Col span={2}></Col>
                </Row>
            </Content>
        </React.Fragment>
    );
};

export default LoggingOut;