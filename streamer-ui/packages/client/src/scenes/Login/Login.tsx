import React from "react";

import {
    Card,
    Button,
    Row,
    Col
} from "antd";

import "../../app/App.less";
import logoDCCN from "../../assets/dccn-logo.png";

const Login: React.FC = () => {

    return (
        <div className="Login">
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
                    <p>Its purpose is to upload files from a PC to 1) your project folder on central storage and
                    2) to the Donders Repository. The destination follows a standardized folder structure.</p>
                    <Button
                        href="/oidc/login"
                        className="login-form-button"
                        type="primary"
                        htmlType="submit">
                        Log in
                    </Button>
                </Card>
            </Col>
            <Col span={2}></Col>
        </Row>
        </div>
    );
};

export default Login;