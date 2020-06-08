import React, { useState } from "react";
import { withRouter, RouteComponentProps } from "react-router-dom";

import { UserProfile, LoginStatus, ServerResponse } from "../types/types";
import { handleSignIn, handleSignOut } from "../services/auth/auth";

import AppLoggingIn from "./AppLoggingIn";
import AppLogin from "./AppLogin";
import AppLoggedIn from "./AppLoggedIn";
import AppLoggingOut from "./AppLoggingOut";
import AppLoginError from "./AppLoginError";

import "./App.less";

type AppProps = RouteComponentProps;

function getEnvBoolean(envVariable: string | undefined) {
    return envVariable ? (envVariable === "true") : false;
};

// Check skipping of authentication (for development)
const skipAuth = false; // getEnvBoolean(process.env.REACT_APP_STREAMER_UI_MOCK_AUTH);

// Check mocking of Project Database access (for development)
const mockPdb = getEnvBoolean(process.env.REACT_APP_STREAMER_UI_MOCK_PROJECT_DATABASE);

const App: React.FC<AppProps> = () => {

    const [userProfile, setUserProfile] = useState({
        username: "",
        displayName: null,
        password: "",
        isAuthenticated: false
    } as UserProfile);

    const [loginStatus, setLoginStatus] = useState(LoginStatus.NotLoggedIn);
    const [errorMessage, setErrorMessage] = useState("");

    const signIn = async (username: string, password: string) => {
        setLoginStatus(LoginStatus.LoggingIn);

        let result: ServerResponse = {
            error: null,
            data: ""
        };

        if (!skipAuth) {
            try {
                result = await handleSignIn(username, password);
            } catch (err) {
                setErrorMessage(err.message as string);
                setLoginStatus(LoginStatus.LoggingError);
                throw err;
            }

            // Double check result for error
            if (result.error && result.error !== "") {
                setErrorMessage(result.error);
                setLoginStatus(LoginStatus.LoggingError);
                throw new Error(result.error);
            }
        }

        setUserProfile({
            username,
            displayName: null,
            password,
            isAuthenticated: true
        } as UserProfile);
        setLoginStatus(LoginStatus.LoggedIn);

        return result;
    };

    const signOut = async (username: string, password: string) => {
        setLoginStatus(LoginStatus.LoggingOut);

        let result: ServerResponse;
        try {
            result = await handleSignOut(username, password);
        } catch (err) {
            setErrorMessage(err.message as string);
            setLoginStatus(LoginStatus.LoggingError);
            throw err;
        }

        // Double check result for error
        if (result.error && result.error !== "") {
            setErrorMessage(result.error);
            setLoginStatus(LoginStatus.LoggingError);
            throw new Error(result.error);
        }

        setUserProfile({
            username: "",
            displayName: null,
            password: "",
            isAuthenticated: false
        } as UserProfile);
        setLoginStatus(LoginStatus.NotLoggedIn);

        return result;
    };

    switch (loginStatus) {
        case LoginStatus.NotLoggedIn:
            return <AppLogin
                userProfile={userProfile}
                signIn={signIn}
            />;
        case LoginStatus.LoggingIn:
            return <AppLoggingIn />;
        case LoginStatus.LoggedIn:
            return <AppLoggedIn
                userProfile={userProfile}
                signIn={signIn}
                signOut={signOut}
                mockPdb={mockPdb}
            />;
        case LoginStatus.LoggingOut:
            return <AppLoggingOut />;
        case LoginStatus.LoggingError:
            return <AppLoginError
                errorMessage={errorMessage}
            />;
    }
};

export default withRouter(App);
