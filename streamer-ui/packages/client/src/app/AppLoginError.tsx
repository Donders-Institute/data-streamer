import React from "react";

import LoginError from "../scenes/LoginError/LoginError";

import "./App.less";

interface AppLoginErrorProps {
    errorMessage: string;
}

const AppLogin: React.FC<AppLoginErrorProps> = ({ errorMessage }) => {
    return <LoginError errorMessage={errorMessage} />;
}

export default AppLogin;
