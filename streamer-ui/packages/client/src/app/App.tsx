import React, { useReducer } from "react";
import { withRouter, RouteComponentProps } from "react-router-dom";

import {
    AuthStatus,
    AuthState,
    AuthAction,
    AuthActionType,
    initialAuthState
} from "../types/types";

import AppLoggedIn from "./AppLoggedIn";

import "./App.less";
import { AuthContext } from "../services/auth/authContext";
import Login from "../scenes/Login/Login";

type AppProps = RouteComponentProps;

function authReducer(_: AuthState, action: AuthAction) {
    switch (action.type) {
        case AuthActionType.NotSignedIn:
            return initialAuthState;
        case AuthActionType.Selecting:
            return {
                ...(action.payload),
                status: AuthStatus.Selecting
            };
        case AuthActionType.SigningIn:
            return {
                ...(action.payload),
                status: AuthStatus.LoggingIn
            };
        case AuthActionType.SignedIn:
            return {
                ...(action.payload),
                status: AuthStatus.LoggedIn
            };
        case AuthActionType.SigningOut:
            return {
                ...(action.payload),
                status: AuthStatus.LoggingOut
            };
    }
};

const App: React.FC<AppProps> = () => {

    // Book keeping of auth state
    const [authState, authDispatch] = useReducer(authReducer, initialAuthState);

    // determin page component based on the `authState.status`
    const content = () => {
        switch (authState.status) {
            case AuthStatus.LoggedIn:
                return <AppLoggedIn/>;
            default:
                return <Login/>;
        }
    };

    return (
        <AuthContext.Provider value={{state: authState, updateState: authDispatch}}>
            { content() }
        </AuthContext.Provider>
    );
};

export default withRouter(App);
