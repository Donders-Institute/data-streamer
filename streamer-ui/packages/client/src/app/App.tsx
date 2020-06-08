import React, { useReducer } from "react";
import { withRouter, RouteComponentProps } from "react-router-dom";

import {
    LoginStatus,
    AuthState,
    AuthAction,
    AuthActionType,
    ErrorState,
    ErrorType,
    ErrorAction,
    initialAuthState,
    initialErrorState
} from "../types/types";

import {
    useSigningIn,
    useSigningOut
} from "../services/auth/auth";

import AppLoggingIn from "./AppLoggingIn";
import AppLogin from "./AppLogin";
import AppLoggedIn from "./AppLoggedIn";
import AppLoggingOut from "./AppLoggingOut";
import AppLoginError from "./AppLoginError";

import {
    useUpdateAuthError
} from "../services/error/error";

import "./App.less";

type AppProps = RouteComponentProps;

function getEnvBoolean(envVariable: string | undefined) {
    return envVariable ? (envVariable === "true") : false;
};

// Check skipping of authentication (for development)
const skipAuth = getEnvBoolean(process.env.REACT_APP_STREAMER_UI_MOCK_AUTH);

// Check mocking of Project Database access (for development)
const mockPdb = getEnvBoolean(process.env.REACT_APP_STREAMER_UI_MOCK_PROJECT_DATABASE);

function authReducer(state: AuthState, action: AuthAction) {
    switch (action.type) {
        case AuthActionType.NotSignedIn:
            return initialAuthState;
        case AuthActionType.SigningIn:
            return {
                ...(action.payload),
                status: LoginStatus.LoggingIn
            };
        case AuthActionType.SignedIn:
            return {
                ...(action.payload),
                status: LoginStatus.LoggedIn
            };
        case AuthActionType.SigningOut:
            return {
                ...(action.payload),
                status: LoginStatus.LoggingOut
            };
        case AuthActionType.Error:
            return {
                ...(action.payload),
                status: LoginStatus.LoggingError
            };
    }
};

function authErrorReducer(state: ErrorState, action: ErrorAction) {
    if (action.type === ErrorType.NoError) {
        return initialErrorState;
    }
    return {
        errorType: action.type,
        errorMessage: action.payload.errorMessage
    };
};

const App: React.FC<AppProps> = () => {

    // Book keeping of auth state
    const [authState, authDispatch] = useReducer(authReducer, initialAuthState);

    // Book keeping of error state
    const [authErrorState, authErrorDispatch] = useReducer(authErrorReducer, initialErrorState);

    // Sign in
    const [errorSigningIn, isLoadingSigningIn] = useSigningIn({
        authState,
        authDispatch,
        skipAuth
    });

    useUpdateAuthError({
        isLoading: isLoadingSigningIn,
        error: errorSigningIn,
        errorType: ErrorType.ErrorSignIn,
        errorDispatch: authErrorDispatch,
        authState,
        authDispatch
    });

    // Sign out
    const [errorSigningOut, isLoadingSigningOut] = useSigningOut({
        authState,
        authDispatch,
        skipAuth
    });

    useUpdateAuthError({
        isLoading: isLoadingSigningOut,
        error: errorSigningOut,
        errorType: ErrorType.ErrorSignOut,
        errorDispatch: authErrorDispatch,
        authState,
        authDispatch
    });

    // Handle user input
    const handleChangeUsername = async (username: string) => {
        return authDispatch({
            type: AuthActionType.NotSignedIn,
            payload: {
                ...authState,
                userProfile: {
                    ...authState.userProfile,
                    username
                }
            }
        } as AuthAction);
    };

    const handleChangePassword = async (password: string) => {
        return authDispatch({
            type: AuthActionType.NotSignedIn,
            payload: {
                ...authState,
                userProfile: {
                    ...authState.userProfile,
                    password
                }
            }
        } as AuthAction);
    };

    // Trigger sign in
    const handleSignIn = async () => {
        return authDispatch({
            type: AuthActionType.SigningIn,
            payload: {
                ...authState,
                userProfile: {
                    ...authState.userProfile
                }
            }
        } as AuthAction);
    };

    // Trigger sign out
    const handleSignOut = async () => {
        return authDispatch({
            type: AuthActionType.SigningOut,
            payload: {
                ...authState,
                userProfile: {
                    ...authState.userProfile
                }
            }
        } as AuthAction);
    };

    switch (authState.status) {
        case LoginStatus.NotLoggedIn:
            return <AppLogin
                handleChangeUsername={handleChangeUsername}
                handleChangePassword={handleChangePassword}
                handleSignIn={handleSignIn}
            />;
        case LoginStatus.LoggingIn:
            return <AppLoggingIn />;
        case LoginStatus.LoggedIn:
            return <AppLoggedIn
                userProfile={authState.userProfile}
                handleChangeUsername={handleChangeUsername}
                handleChangePassword={handleChangePassword}
                handleSignIn={handleSignIn}
                handleSignOut={handleSignOut}
                mockPdb={mockPdb}
            />;
        case LoginStatus.LoggingOut:
            return <AppLoggingOut />;
        case LoginStatus.LoggingError:
            return <AppLoginError
                errorMessage={authErrorState.errorMessage}
            />;
    }
};

export default withRouter(App);
