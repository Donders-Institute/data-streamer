import React, { useContext } from "react";
import { Link } from "react-router-dom";

import {
    Layout,
    Row,
    Col,
    Icon,
    Menu,
    Tooltip
} from "antd";

import "../../app/App.less";
import logoDCCN from "../../assets/donders-logo.svg";
import { AuthContext } from "../../services/auth/auth";

const { SubMenu } = Menu;

const Header: React.FC = () => {

    const {profile} = useContext(AuthContext);

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
                                selectedKeys={[]}>
                                <Menu.Item
                                    key="home"
                                    style={{ float: "left", margin: "0px 0px 0px 0px" }}>
                                    <Tooltip
                                        placement="bottomRight"
                                        title="The purpose of the research data uploader is to upload files to the DCCN project storage. The source files are files from your experiments on this computer. The destination is the correct folder on the DCCN project storage.">
                                        <Link to="/">
                                            <img alt="Donders Institute" src={logoDCCN} style={{ height: "20px", marginRight: "10px" }} />
                                                RESEARCH DATA UPLOADER
                                            </Link>
                                    </Tooltip>
                                </Menu.Item>
                            </Menu>
                        </Col>
                        <Col>
                            <Menu
                                className="App-header-menu"
                                theme="dark"
                                mode="horizontal"
                                selectedKeys={[]}>
                                <Menu.Item key="help">
                                    <Tooltip
                                        placement="bottomLeft"
                                        title="Click here for help how to use the research data uploader">
                                        <Link to="/help">
                                            <span style={{ fontWeight: "bold" }}>HELP</span>
                                        </Link>
                                    </Tooltip>
                                </Menu.Item>
                                {
                                    profile &&
                                    <SubMenu
                                        key="profile"
                                        title={
                                            <>
                                                <Icon type="user" style={{ marginRight: "4px" }}/>
                                                <span>{profile.displayName}</span>
                                                <Icon type="caret-down" style={{ margin: "0px" }} />
                                            </>
                                        }
                                        style={{ float: "right", margin: "0px 0px 0px 0px" }}>
                                        <Menu.Item key="auth">
                                            <a href="/logout">
                                                <Icon type="logout"/><strong>Sign out</strong>
                                            </a>
                                        </Menu.Item>
                                    </SubMenu>
                                }
                            </Menu>
                        </Col>
                    </Row>
                </Layout.Header>
            </Layout>
        </React.Fragment>
    );
};

export default Header;
