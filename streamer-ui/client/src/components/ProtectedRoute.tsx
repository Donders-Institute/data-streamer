import React from "react";
import { Route, Redirect } from "react-router-dom";
import { AuthConsumer } from "./Auth/AuthContext";

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