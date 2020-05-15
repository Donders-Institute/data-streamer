import React from "react";
import { Route, Redirect } from "react-router-dom";

import { AuthConsumer } from "../services/auth/auth";

const ProtectedRoute = ({ component: Component, ...rest }: any) => (
    <AuthConsumer>
        {({ isAuthenticated }: any) => (
            <Route
                render={props => isAuthenticated ? <Component {...props} /> : <Redirect to="/login" />}
                {...rest}
            />
        )}
    </AuthConsumer>
);

export default ProtectedRoute;