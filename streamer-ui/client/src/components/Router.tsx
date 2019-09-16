import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";

import About from "./About/About";
import Contact from "./Contact/Contact";
import Uploader from "./Uploader/Uploader";
import Login from "./Login/Login";
import Logout from "./Logout/Logout";
import NotFound from "./NotFound/NotFound";

import "../App.less";

function PrivateRoute({ component: Component, authed, ...rest }: any) {
    return (
        <Route
            {...rest}
            render={(props) => authed === true
                ? <Component {...props} />
                : <Redirect to='/login' />}
        />
    )
}

const Router = (props: any) => (
    <div>
        <Switch>
            <Route path="/login" exact={true} component={Login} />
            <Route path="/logout" exact={true} component={Logout} />
            <PrivateRoute authed={true} path="/" exact={true} component={Uploader} />
            <PrivateRoute authed={true} path="/about" exact={true} component={About} />
            <PrivateRoute authed={true} path="/contact" exact={true} component={Contact} />
            <PrivateRoute authed={true} component={NotFound} />
        </Switch>
    </div>
);

export default Router;