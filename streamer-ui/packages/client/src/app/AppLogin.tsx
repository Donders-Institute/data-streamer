import React from "react";

import Login from "../scenes/Login/Login";

import "./App.less";

import { ErrorState } from "../types/types";

interface AppLoginProps {
    handleChangeUsername: (username: string) => Promise<void>;
    handleChangePassword: (password: string) => Promise<void>;
    handleSignIn: () => Promise<void>;
    enableLoginButton: boolean;
    showAuthErrorModal: boolean;
    handleOkAuthErrorModal: () => Promise<void>;
    authErrorState: ErrorState
}

const AppLogin: React.FC<AppLoginProps> = ({
    handleChangeUsername,
    handleChangePassword,
    handleSignIn,
    enableLoginButton,
    showAuthErrorModal,
    handleOkAuthErrorModal,
    authErrorState
}) => {
    return (
        <Login
            handleChangeUsername={handleChangeUsername}
            handleChangePassword={handleChangePassword}
            handleSignIn={handleSignIn}
            enableLoginButton={enableLoginButton}
            showAuthErrorModal={showAuthErrorModal}
            handleOkAuthErrorModal={handleOkAuthErrorModal}
            authErrorState={authErrorState}
        />
    );
}

export default AppLogin;
