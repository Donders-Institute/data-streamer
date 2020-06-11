import React from "react";

import LoggingRedirecting from "../scenes/LoggingRedirecting/LoggingRedirecting";

import "./App.less";

import { ErrorState } from "../types/types";

interface AppLoggingOutProps {
    showAuthErrorModal: boolean;
    handleOkAuthErrorModal: () => Promise<void>;
    authErrorState: ErrorState
}

const AppLoggingOut: React.FC<AppLoggingOutProps> = ({
    showAuthErrorModal,
    handleOkAuthErrorModal,
    authErrorState
}) => {
    const text = "Logging out ...";
    return (
        <LoggingRedirecting
            text={text}
            showAuthErrorModal={showAuthErrorModal}
            handleOkAuthErrorModal={handleOkAuthErrorModal}
            authErrorState={authErrorState}
        />
    );
}

export default AppLoggingOut;
