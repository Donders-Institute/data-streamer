import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { Layout, Row, Col, Icon, Menu, Button, Modal } from "antd";
import axios, { AxiosError, AxiosResponse, AxiosRequestConfig } from "axios";

import { AuthContext } from "../Auth/AuthContext";

import "../../App.less";

import logoDCCN from "../../assets/dccn-logo.png";

function modalError(msg: string) {
    Modal.error({
        title: 'Error',
        content: msg,
        onOk() {
            Modal.destroyAll();
        }
    });
}

const Header: React.FC = () => {
    const authContext = useContext(AuthContext);

    const handleLogoutResponse = (response: AxiosResponse) => {
        console.log(response.data);
        console.log(response.status);
        console.log(response.statusText);
        console.log(response.headers);
        console.log(response.config);
        authContext!.signout();
    };

    const handleLogoutError = (error: AxiosError) => {
        var errorMessage = "";
        if (error.response) {
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
            errorMessage = JSON.stringify(error.response.data, null, 2);
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
                timeout: 1000,
                withCredentials: false,
                responseType: "json"
            };

            resolve(
                axios(config)
                    .then(handleLogoutResponse)
                    .catch(handleLogoutError));
        });
    };

    return (
        <Layout>
            <div>
                <Layout>
                    <Layout.Header
                        style={{
                            backgroundColor: "#fff",
                            padding: "10px 20px 10px 20px",
                            height: "94px"
                        }}
                    >
                        <Row type="flex" justify="space-between">
                            <Col>
                                <img alt="Donders Institute" src={logoDCCN} height={64} />
                            </Col>
                            <Col></Col>
                        </Row>
                    </Layout.Header>
                </Layout>
                <Layout>
                    <Layout.Header
                        className="App-header-top"
                        style={{ padding: "0 0px", height: "12px" }}
                    ></Layout.Header>
                </Layout>
                <Layout>
                    <Layout.Header
                        className="App-header"
                        style={{ padding: "0px 20px 0px 0px" }}
                    >
                        <Row type="flex" justify="space-between">
                            <Col>
                                <Menu
                                    className="App-header-menu"
                                    theme="dark"
                                    mode="horizontal"
                                    selectedKeys={["home"]}
                                >
                                    <Menu.Item key="home" style={{ float: "left" }}>
                                        <Link to="/">
                                            &nbsp;&nbsp;<Icon type="home" />
                                        </Link>
                                    </Menu.Item>
                                </Menu>
                            </Col>
                            <Col>
                                <span style={{ fontWeight: "bold", color: "#fff" }}>{authContext!.username}</span>&nbsp;&nbsp;
                                <Button size="small" ghost onClick={handleLogout}>
                                    Log out
                                </Button>
                            </Col>
                        </Row>
                    </Layout.Header>
                </Layout>
            </div>
        </Layout >
    );
};

export default Header;
