import React from "react";

import Login from "../scenes/Login/Login";

import "./App.less";

interface AppLoginProps {
    handleChangeUsername: (username: string) => Promise<void>;
    handleChangePassword: (password: string) => Promise<void>;
    handleSignIn: () => Promise<void>;
}

const AppLogin: React.FC<AppLoginProps> = ({
    handleChangeUsername,
    handleChangePassword,
    handleSignIn,
}) => {
    return (
        <Login
            handleChangeUsername={handleChangeUsername}
            handleChangePassword={handleChangePassword}
            handleSignIn={handleSignIn}
        />
    );
}

export default AppLogin;
