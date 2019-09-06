import * as React from "react";
import { connect } from "react-redux";
import { AppState } from "../../store";
import { Link } from "react-router-dom";

import { SystemState } from "../../store/system/types";
import { updateSession } from "../../store/system/actions";

import { CalendarsState } from "../../store/calendars/types";
import { sendMessage } from "../../store/calendars/actions";

import Auth, { LOGGEDIN } from "../Auth/Auth";

import "../../App.less";
import logoDCCN from "../../assets/dccn-logo.png";

import { Layout, Row, Col, Icon, Menu, Button } from "antd";

interface AppProps {
    sendMessage: typeof sendMessage;
    updateSession: typeof updateSession;
    system: SystemState;
    calendars: CalendarsState;
}

class Header extends React.Component<AppProps> {
    state = {
        loggedIn: this.props.system.loggedIn,
        location: this.props.system.location
    };

    componentDidMount() {
        this.props.updateSession({
            loggedIn: LOGGEDIN,
            session: "my_session",
            userName: "rutvdee",
            location: this.props.system.location
        });
    }

    sendMessage = (message: string) => {
        this.props.sendMessage({
            user: this.props.system.userName,
            message: message,
            timestamp: new Date().getTime()
        });
        this.setState({ location: "" });
    };

    updateLocation = (newLocation: string) => {
        this.props.updateSession({
            loggedIn: LOGGEDIN,
            session: "my_session",
            userName: "rutvdee",
            location: newLocation
        });
        this.setState({ location: newLocation });
    };

    render() {
        return (
            <Layout>
                <Layout>
                    <Layout.Header style={{ backgroundColor: "#fff", padding: "10px 20px 10px 20px", height: "94px" }}>
                        <Row type="flex" justify="space-between">
                            <Col>
                                <img alt="Donders Institute" src={logoDCCN} height={64} />
                            </Col>
                            <Col>
                            </Col>
                        </Row>
                    </Layout.Header>
                </Layout>
                <Layout>
                    <Layout.Header className="App-header-top" style={{ padding: "0 0px", height: "12px" }}>
                    </Layout.Header>
                </Layout>
                <Layout>
                    <Layout.Header className="App-header" style={{ padding: "0px 20px 0px 0px" }}>
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
                                            <Icon type="home" />Lab Streamer UI
                                        </Link>
                                    </Menu.Item>
                                </Menu>
                            </Col>
                            <Col>
                                {!this.state.loggedIn && <Auth />}
                                {this.state.loggedIn && <Link to="/logout"><Button size="small" ghost>Log out</Button></Link>}
                            </Col>
                        </Row>
                    </Layout.Header>
                </Layout>
            </Layout >
        );
    }
}

const mapStateToProps = (state: AppState) => ({
    system: state.system,
    calendars: state.calendars
});

export default connect(
    mapStateToProps,
    { sendMessage, updateSession }
)(Header);
