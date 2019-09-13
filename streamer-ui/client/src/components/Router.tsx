import React from "react";
import { Switch, Route } from "react-router-dom";

import About from "./About/About";
import Contact from "./Contact/Contact";
import Uploader from "./Uploader/Uploader";
import Login from "./Login/Login";
import Logout from "./Logout/Logout";
import NotFound from "./NotFound/NotFound";

import "../App.less";

const Router = (props: any) => (
    <div>
        <Switch>
            <Route path="/login" exact={true} component={Login} />
            <Route path="/logout" exact={true} component={Logout} />
            <Route path="/" exact={true} component={Uploader} />
            <Route path="/about" exact={true} component={About} />
            <Route path="/contact" exact={true} component={Contact} />
            <Route component={NotFound} />
        </Switch>
    </div>
);

export default Router;