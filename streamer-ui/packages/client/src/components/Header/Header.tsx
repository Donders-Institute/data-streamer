import React from "react";
import { Link } from "react-router-dom";

import {
    Layout,
    Row,
    Col,
    Icon,
    Menu,
    Modal,
    Tooltip
} from "antd";

import { UserProfile, ServerResponse } from "../../types/types";

import "../../app/App.less";
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

interface HeaderProps {
    userProfile: UserProfile;
    signOut: (username: string, password: string) => Promise<ServerResponse>;
}

const Header: React.FC<HeaderProps> = ({ userProfile, signOut }) => {

    const LOCATION_HOME = "home";
    const LOCATION_HELP = "help";
    const LOCATION_AUTH = "auth";

    async function handleSignOut() {
        let result: ServerResponse;
        try {
            result = await signOut(userProfile.username, userProfile.password);
        } catch (err) {
            console.error('Sign out failure');
            console.error(err);
            const errorMessage = JSON.stringify(err);
            modalError(errorMessage);
            return; // Abort
        }

        // Double check result for errors
        if (result.error && result.error !== "") {
            console.error('Sign out failure');
            const errorMessage = result.error as string;
            console.error(errorMessage);
            modalError(errorMessage);
            return; // Abort
        }

        console.log('Successfully signed out');
    };

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
                                            <Icon type="user" style={{ marginRight: "4px" }} /><span>{userProfile.username}</span><Icon type="caret-down" style={{ margin: "0px" }} />
                                        </span>
                                    }
                                    style={{ float: "right", margin: "0px 0px 0px 0px" }}
                                >
                                    <Menu.Item
                                        key={LOCATION_AUTH}
                                    >
                                        <a onClick={() => { handleSignOut(); }}>
                                            <Icon type="logout" /> <span><strong>Sign out</strong></span>
                                        </a>
                                    </Menu.Item>
                                </SubMenu>
                            </Menu>
                        </Col>
                    </Row>
                </Layout.Header>
            </Layout>
        </React.Fragment>
    );
};

export default Header;
