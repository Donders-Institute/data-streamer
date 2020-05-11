import React from "react";
import { Switch, Route } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";

import Help from "../scenes/Help/Help";
import Uploader from "../scenes/Uploader/scenes/Uploader/Uploader";
import Login from "../scenes/Login/Login";
import NotFound from "../scenes/NotFound/NotFound";

import "../App.less";

const App: React.FC = () => {
    return (
        <Switch>
            <Route path="/login" exact={true} component={Login} />
            <ProtectedRoute path="/" exact={true} component={Uploader} />
            <ProtectedRoute path="/help" exact={true} component={Help} />
            <ProtectedRoute component={NotFound} />
        </Switch>
    );
};

export default App;
