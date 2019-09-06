import * as React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { Layout, Row, Col } from "antd";

import { AppState } from "../../store";
import { SystemState, LOCATION_HOME } from "../../store/system/types";
import { updateSession } from "../../store/system/actions";
import { CalendarsState } from "../../store/calendars/types";
import { sendMessage } from "../../store/calendars/actions";

import "../../App.less";

interface AppProps {
    sendMessage: typeof sendMessage;
    updateSession: typeof updateSession;
    system: SystemState;
    calendars: CalendarsState;
}

class Footer extends React.Component<AppProps> {
    state = {
        message: ""
    };

    componentDidMount() {
        this.props.updateSession({
            loggedIn: true,
            session: "my_session",
            userName: "rutvdee",
            location: LOCATION_HOME
        });
    }

    sendMessage = (message: string) => {
        this.props.sendMessage({
            user: this.props.system.userName,
            message: message,
            timestamp: new Date().getTime()
        });
        this.setState({ message: "" });
    };

    updateLocation = (newLocation: string) => {
        this.props.updateSession({
            loggedIn: true,
            session: "my_session",
            userName: "someuser",
            location: newLocation
        });
    };

    render() {
        return (
            <Layout.Footer style={{ padding: "20px 0px 20px 20px" }}>
                <Row type="flex" align-content="flex-end">
                    <Col>
                        <div>
                            <Link to="/about/">About the Streamer UI</Link>
                        </div>
                        <div>
                            <Link to="/contact/">Contact</Link>
                        </div>
                    </Col>
                </Row>
            </Layout.Footer>
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
)(Footer);
