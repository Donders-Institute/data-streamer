import React from "react";

import LoggingRedirecting from "../scenes/LoggingRedirecting/LoggingRedirecting";

import "./App.less";

import { ErrorState } from "../types/types";

interface AppLoggingInProps {
    showAuthErrorModal: boolean;
    handleOkAuthErrorModal: () => Promise<void>;
    authErrorState: ErrorState
}

const AppLoggingIn: React.FC<AppLoggingInProps> = ({
    showAuthErrorModal,
    handleOkAuthErrorModal,
    authErrorState
}) => {
    const text = "Redirecting ...";
    return (
        <LoggingRedirecting
            text={text}
            showAuthErrorModal={showAuthErrorModal}
            handleOkAuthErrorModal={handleOkAuthErrorModal}
            authErrorState={authErrorState}
        />
    );
}

export default AppLoggingIn;