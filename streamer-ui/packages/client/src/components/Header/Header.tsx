import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { Layout, Row, Col, Icon, Menu, Button, Modal, Tooltip } from "antd";
import axios, { AxiosError, AxiosResponse, AxiosRequestConfig } from "axios";

import { AuthContext } from "../Auth/AuthContext";

import "../../App.less";

import logoDCCN from "../../assets/donders-logo.svg";

const { SubMenu } = Menu;

function modalError(msg: string) {
    Modal.error({
        title: "Error",
        content: msg,
        onOk() {
            Modal.destroyAll();
        }
    });
}

const Header: React.FC = () => {
    const LOCATION_HOME = "home";
    const LOCATION_HELP = "help";
    const LOCATION_AUTH = "auth";

    const authContext = useContext(AuthContext);

    const handleLogoutResponse = (response: AxiosResponse) => {
        // console.log(response.data);
        // console.log(response.status);
        // console.log(response.statusText);
        // console.log(response.headers);
        // console.log(response.config);
        authContext!.signOut();
    };

    const handleLogoutError = (error: AxiosError) => {
        var errorMessage = "could not connect to data streamer UI server";
        if (error.response) {
            // console.log(error.response.data);
            // console.log(error.response.status);
            // console.log(error.response.headers);
            if (error.response.data) {
                errorMessage = JSON.stringify(error.response.data, null, 2);
            }
        } else {
            console.log(error.message);
            errorMessage = error.message;
        }
        modalError(errorMessage);
        return error;
    };

    const handleLogout = () => {
        return new Promise((resolve) => {
            const config: AxiosRequestConfig = {
                url: "/logout",
                method: "post",
                timeout: 2000,
                withCredentials: true,
                auth: {
                    username: authContext!.username,
                    password: authContext!.password
                },
                responseType: "json"
            };

            resolve(
                axios(config)
                    .then(handleLogoutResponse)
                    .catch(handleLogoutError));
        });
    };

    return (
        <div>
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
                                <Menu.Item
                                    key={LOCATION_HOME}
                                    style={{ float: "left", margin: "0px 0px 0px 0px" }}
                                >
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
                                selectedKeys={[]}
                            >
                                <Menu.Item
                                    key={LOCATION_HELP}
                                >
                                    <Tooltip
                                        placement="bottomLeft"
                                        title="Click here for help how to use the research data uploader">
                                        <Link to="/help">
                                            <span style={{ fontWeight: "bold" }}>
                                                HELP
                                                </span>
                                        </Link>
                                    </Tooltip>
                                </Menu.Item>
                                <SubMenu
                                    key="profile"
                                    title={
                                        <span>
                                            <Icon type="user" style={{ marginRight: "4px" }} /><span>{authContext!.username}</span><Icon type="caret-down" style={{ margin: "0px" }} />
                                        </span>
                                    }
                                    style={{ float: "right", margin: "0px 0px 0px 0px" }}
                                >
                                    <Menu.Item
                                        key={LOCATION_AUTH}
                                    >
                                        <a onClick={() => { handleLogout(); }}>
                                            <Icon type="logout" /> <span><strong>Sign out</strong></span>
                                        </a>
                                    </Menu.Item>
                                </SubMenu>
                            </Menu>
                        </Col>
                    </Row>
                </Layout.Header>
            </Layout>
        </div>
    );
};

export default Header;
