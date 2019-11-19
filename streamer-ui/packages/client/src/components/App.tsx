import React from "react";
import { Switch, Route } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";

import Help from "./Help/Help";
import Uploader from "./Uploader/Uploader";
import Login from "./Login/Login";
import NotFound from "./NotFound/NotFound";

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
