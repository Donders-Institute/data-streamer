import React from "react";
import { render } from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import * as serviceWorker from "./serviceWorker";

import App from "./app/App";

import "./index.less";

// Validate the mandatory environment variables
let mandatoryEnvVariables: string[] = [
    "REACT_APP_STREAMER_UI_MOCK_AUTH",
    "REACT_APP_STREAMER_UI_MOCK_PROJECT_DATABASE",
    "REACT_APP_STREAMER_UI_INTERNAL_SERVER_API_URL",
    "REACT_APP_STREAMER_UI_EXTERNAL_SERVER_API_URL"
];
mandatoryEnvVariables.map(name => {
    const value = process.env[name];
    if (!value) {
        throw new Error(`${name} variable not set`);
    }
});

const Root: React.FC = () => {
    return (
        <Router>
            <App />
        </Router>
    );
};

render(<Root />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
