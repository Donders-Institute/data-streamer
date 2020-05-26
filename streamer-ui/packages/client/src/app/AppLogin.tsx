import React from "react";

import Login from "../scenes/Login/Login";
import { UserProfile, ServerResponse } from "../types/types";

import "./App.less";

interface AppLoginProps {
    userProfile: UserProfile;
    signIn: (username: string, password: string) => Promise<ServerResponse>;
}

const AppLogin: React.FC<AppLoginProps> = ({ userProfile, signIn }) => {
    return <Login userProfile={userProfile} signIn={signIn} />;
}

export default AppLogin;
