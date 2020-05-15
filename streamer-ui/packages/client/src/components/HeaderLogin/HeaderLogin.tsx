import React from "react";
import { Layout, Row, Col, Menu } from "antd";

import "../../App.less";

import logoDCCN from "../../assets/donders-logo.svg";

const HeaderLogin: React.FC = () => {
    return (
        <React.Fragment>
            <Layout>
                <Layout.Header className="App-header-top"></Layout.Header>
            </Layout>
            <Layout>
                <Layout.Header className="App-header">
                    <Row type="flex" justify="space-between">
                        <Col>
                            <Menu
                                className="App-header-menu"
                                theme="dark"
                                mode="horizontal"
                                selectedKeys={[]}
                            >
                                <Menu.Item key="NAV_HOME" style={{ float: "left", margin: "0px 0px 0px 0px" }}>
                                    <img alt="Donders Institute" src={logoDCCN} style={{ height: "20px", marginRight: "10px" }} />RESEARCH DATA UPLOADER
                                    </Menu.Item>
                            </Menu>
                        </Col>
                        <Col>
                        </Col>
                    </Row>
                </Layout.Header>
            </Layout>
        </React.Fragment>
    );
};

export default HeaderLogin;
