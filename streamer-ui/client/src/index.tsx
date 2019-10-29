import React, { useState } from "react";
import { render } from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import * as serviceWorker from "./serviceWorker";

import App from "./components/App";
import { AuthProvider } from "./components/Auth/AuthContext";
import { UploaderProvider } from "./components/Uploader/UploaderContext";

import "./index.less";

const Root: React.FC = () => {

    const authenticate = async (username: string, password: string, ipAddress: string) => {
        setAuthContext(state => (
            {
                ...state,
                username: username,
                password: password,
                ipAddress: ipAddress,
                isAuthenticated: true
            }
        ));
    };

    const signout = () => {
        setAuthContext(state => (
            {
                ...state,
                username: "",
                password: "",
                ipAddress: "",
                isAuthenticated: false
            }
        ));
    };

    const [authContext, setAuthContext] = useState({
        username: "",
        password: "",
        ipAddress: "",
        isAuthenticated: false,
        authenticate: authenticate,
        signout: signout
    });

    const [uploaderContext, setUploaderContext] = useState({
        test: "test"
    });

    return (
        <AuthProvider value={authContext}>
            <UploaderProvider value={uploaderContext}>
                <Router>
                    <App />
                </Router>
            </UploaderProvider>
        </AuthProvider>
    );
};

render(<Root />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
