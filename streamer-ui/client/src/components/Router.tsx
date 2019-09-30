import React, { useState } from "react";
import { Switch, Route } from "react-router-dom";

import { AuthContextProvider } from "./Auth/AuthContext";
import ProtectedRoute from "./ProtectedRoute";

import About from "./About/About";
import Help from "./Help/Help";
import Contact from "./Contact/Contact";
import Uploader from "./Uploader/Uploader";
import Login from "./Login/Login";
import NotFound from "./NotFound/NotFound";

import "../App.less";

interface IProps {
    title?: string | undefined;
}

const Router: React.FC<IProps> = () => {
    const authenticate = (username: string, password: string) => {
        setAuthContext(state => ({ ...state, username: username, password: password, isAuthenticated: true }));
    };

    const signout = () => {
        setAuthContext(state => ({ ...state, username: "", password: "", isAuthenticated: false }));
    };

    const [authContext, setAuthContext] = useState({
        username: "",
        password: "",
        isAuthenticated: false,
        authenticate: authenticate,
        signout: signout
    });

    return (
        <AuthContextProvider value={authContext}>
            <Switch>
                <Route path="/login" exact={true} component={Login} />
                <ProtectedRoute path="/" exact={true} component={Uploader} />
                <ProtectedRoute path="/about" exact={true} component={About} />
                <ProtectedRoute path="/help" exact={true} component={Help} />
                <ProtectedRoute path="/contact" exact={true} component={Contact} />
                <ProtectedRoute component={NotFound} />
            </Switch>
        </AuthContextProvider>
    );
};

export default Router;