import * as React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { Layout } from "antd";
import { connect } from "react-redux";
import { AppState } from "../store";

import Header from './Header/Header';
import Footer from './Footer/Footer';

import About from './About/About';
import Contact from './Contact/Contact';

import Uploader from './Uploader/Uploader';

import { LOGGEDIN } from "./Auth/Auth";

import NotFound from './NotFound/NotFound';

import { SystemState } from "../store/system/types";
import { updateSession } from "../store/system/actions";
import { CalendarsState } from "../store/calendars/types";
import { sendMessage } from "../store/calendars/actions";

import "../App.less";

interface AppProps {
    sendMessage: typeof sendMessage;
    updateSession: typeof updateSession;
    system: SystemState;
    calendars: CalendarsState;
}

class App extends React.Component<AppProps> {

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
        this.setState({ location: newLocation })
    };

    render() {
        return (
            <Router>
                <Layout>
                    <Header />
                    <Layout.Content>
                        <Layout>
                            <Switch>
                                <Route exact path="/" component={Uploader} />
                                <Route path="/about" component={About} />
                                <Route path="/contact" component={Contact} />
                                <Route component={NotFound} />
                            </Switch>
                        </Layout>
                    </Layout.Content>
                    <Footer />
                </Layout >
            </Router>
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
)(App);
