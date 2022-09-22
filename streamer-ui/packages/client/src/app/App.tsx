import React, { useReducer, useEffect, useState } from "react";
import { withRouter, RouteComponentProps } from "react-router-dom";

import {
    AuthStatus,
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
    useValidateAuthSelection,
    useSigningIn,
    useSigningOut
} from "../services/auth/auth";

import AppLoggingIn from "./AppLoggingIn";
import AppLogin from "./AppLogin";
import AppLoggedIn from "./AppLoggedIn";
import AppLoggingOut from "./AppLoggingOut";

import {
    resetError,
    useUpdateAuthError
} from "../services/error/error";

import "./App.less";

type AppProps = RouteComponentProps;

function getEnvBoolean(envVariable: string | undefined) {
    return envVariable ? (envVariable === "true") : false;
};

function authReducer(state: AuthState, action: AuthAction) {
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

    // Validation of user input. If valid, enable the login button.
    const [isValidAuthSelection, errorAuthSelect, isLoadingValidateAuthSelection] = useValidateAuthSelection(authState);

    useEffect(() => {
        let mounted = true;

        const checkAuthSelection = (isValid: boolean) => {
            if (authState.status === AuthStatus.Selecting) {
                if (mounted) {
                    authDispatch({
                        type: AuthActionType.Selecting,
                        payload: {
                            ...authState,
                            isValidSelection: isValid
                        }
                    } as AuthAction);
                }
            }
        };
        checkAuthSelection(isValidAuthSelection);

        return function cleanup() {
            mounted = false;
        };
    }, [authState.status, isValidAuthSelection]);

    useUpdateAuthError({
        error: errorAuthSelect,
        errorType: ErrorType.ErrorSelectAuth,
        errorDispatch: authErrorDispatch,
        authStatus: authState.status
    });

    const enableLoginButton = isValidAuthSelection;

    // Sign in
    const [errorSigningIn, isLoadingSigningIn] = useSigningIn({
        authState,
        authDispatch
    });

    useUpdateAuthError({
        error: errorSigningIn,
        errorType: ErrorType.ErrorSignIn,
        errorDispatch: authErrorDispatch,
        authStatus: authState.status
    });

    // Sign out
    const [errorSigningOut, isLoadingSigningOut] = useSigningOut({
        authState,
        authDispatch
    });

    useUpdateAuthError({
        error: errorSigningOut,
        errorType: ErrorType.ErrorSignOut,
        errorDispatch: authErrorDispatch,
        authStatus: authState.status
    });

    const showAuthErrorModal = (
        authState.status !== AuthStatus.NotLoggedIn &&
        authState.status !== AuthStatus.Selecting &&
        authErrorState.errorType !== ErrorType.NoError
    );

    // Handle user input
    const handleChangeUsername = async (username: string) => {
        return authDispatch({
            type: AuthActionType.Selecting,
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
            type: AuthActionType.Selecting,
            payload: {
                ...authState,
                userProfile: {
                    ...authState.userProfile,
                    password
                }
            }
        } as AuthAction);
    };

    // Deal with eror modal OK
    const handleOkAuthErrorModal = async () => {
        await resetError(authErrorDispatch);
        return authDispatch({
            type: AuthActionType.NotSignedIn,
            payload: { ...authState }
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

    if (authState.status === AuthStatus.LoggedIn) {
        return <AppLoggedIn
            userProfile={authState.userProfile}
            handleChangeUsername={handleChangeUsername}
            handleChangePassword={handleChangePassword}
            handleSignIn={handleSignIn}
            handleSignOut={handleSignOut}
            enableLoginButton={enableLoginButton}
            showAuthErrorModal={showAuthErrorModal}
            handleOkAuthErrorModal={handleOkAuthErrorModal}
            authErrorState={authErrorState}
        />;
    } else if (authState.status === AuthStatus.LoggingIn) {
        return <AppLoggingIn
            showAuthErrorModal={showAuthErrorModal}
            handleOkAuthErrorModal={handleOkAuthErrorModal}
            authErrorState={authErrorState}
        />;
    } else if (authState.status === AuthStatus.LoggingOut) {
        return <AppLoggingOut
            showAuthErrorModal={showAuthErrorModal}
            handleOkAuthErrorModal={handleOkAuthErrorModal}
            authErrorState={authErrorState}
        />;
    } else {
        return <AppLogin
            handleChangeUsername={handleChangeUsername}
            handleChangePassword={handleChangePassword}
            handleSignIn={handleSignIn}
            enableLoginButton={enableLoginButton}
            showAuthErrorModal={showAuthErrorModal}
            handleOkAuthErrorModal={handleOkAuthErrorModal}
            authErrorState={authErrorState}
        />;
    }
};

export default withRouter(App);
