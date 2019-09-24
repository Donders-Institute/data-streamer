import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { AuthContextConsumer } from './Auth/AuthContext';

const ProtectedRoute = ({ component: Component, ...rest }: any) => (
    <AuthContextConsumer>
        {({ isAuthenticated }: any) => (
            <Route
                render={props => isAuthenticated ? <Component {...props} /> : <Redirect to="/login" />}
                {...rest}
            />
        )}
    </AuthContextConsumer>
)

export default ProtectedRoute