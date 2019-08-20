import gql from "graphql-tag";
import React, { useRef, useEffect } from "react";
import { Query, QueryResult, withApollo, WithApolloClient } from "react-apollo";
import { Button, Typography } from "antd";
import { Route, Switch, withRouter, RouteComponentProps, Redirect } from "react-router-dom";
import { UserManager } from "oidc-client";
import { GetLoginState, StartLogout, StartLogin, EndLoginErrorVariables, EndLoginSuccessVariables, EndLoginSuccess, EndLoginError } from "./gqlTypes";

// To be removed
export const LOGGEDIN = true;

const GET_LOGIN_STATE = gql`
    query GetLoginState {
        loginState @client {
            status
            user {
                userName
                displayName
            }
            error
        }
    }
`;

const START_LOGIN = gql`
    mutation StartLogin {
        startLogin @client {
            status
        }
    }
`;

const END_LOGIN_SUCCESS = gql`
    mutation EndLoginSuccess($userName: String!, $displayName: String) {
        endLoginSuccess(userName: $userName, displayName: $displayName) @client {
            status
        }
    }
`;

const END_LOGIN_ERROR = gql`
    mutation EndLoginError($error: String!) {
        endLoginError(error: $error) @client {
            status
        }
    }
`;

const START_LOGOUT = gql`
    mutation StartLogout {
        startLogout @client {
            status
        }
    }
`;

type AuthProps = WithApolloClient<RouteComponentProps>;

const Auth: React.FC<AuthProps> = ({ client, history }) => {
    const userManager = useRef<UserManager>();

    useEffect(() => {
        const baseUrl = window.location.origin;
        userManager.current = new UserManager({
            client_id: "bookings-ui",
            redirect_uri: `${baseUrl}/callback`,
            response_type: "code",
            scope: "openid profile",
            authority: "https://auth-dev.dccn.nl",
            silent_redirect_uri: `${baseUrl}/silent_renew`,
            automaticSilentRenew: false,
            filterProtocolClaims: true,
            loadUserInfo: true,
            revokeAccessTokenOnSignout: true
        });
    }, []);

    useEffect(() => {
        const runAsync = async () => {
            const isCallback = history.location.pathname === "/callback";
            if (isCallback) {
                await client.mutate<StartLogin>({
                    mutation: START_LOGIN,
                });
            }
            try {
                const user = isCallback
                    ? await userManager.current!.signinRedirectCallback()
                    : await userManager.current!.getUser();

                if (user) {
                    await client.mutate<EndLoginSuccess, EndLoginSuccessVariables>({
                        mutation: END_LOGIN_SUCCESS,
                        variables: {
                            userName: user.profile.sub,
                            displayName: user.profile.name || null
                        }
                    });
                }
            } catch (error) {
                if (error instanceof Error) {
                    await client.mutate<EndLoginError, EndLoginErrorVariables>({
                        mutation: END_LOGIN_ERROR,
                        variables: {
                            error: error.message
                        }
                    });
                } else {
                    throw error;
                }
            }
        }

        runAsync();
    }, []);

    return (
        <Query query={GET_LOGIN_STATE} fetchPolicy="cache-only">
            {({ client, loading, error, data }: QueryResult<GetLoginState>) => {
                const handleLoginClick = async (_event: React.MouseEvent<any>) => {
                    await client.mutate<StartLogin>({
                        mutation: START_LOGIN
                    });
                    await userManager.current!.signinRedirect();
                }

                const handleLogoutClick = async (_event: React.MouseEvent<any>) => {
                    await client.mutate<StartLogout>({
                        mutation: START_LOGOUT
                    });
                    await userManager.current!.signoutRedirect();
                }

                if (error) {
                    return <Typography.Text type="danger">Error: {error}</Typography.Text>;
                }
                if (loading) {
                    return <Typography.Text type="secondary">Loading...</Typography.Text>;
                }
                const { loginState } = data!;
                switch (loginState.status) {
                    case "LOGGED_IN":
                        return (
                            <Switch>
                                <Redirect from="/callback" to="/" exact />
                                <Route render={() => <Button size="small" ghost onClick={handleLogoutClick}>Log out</Button>} />
                            </Switch>
                        );
                    case "LOGGING_IN":
                        return <Typography.Text type="secondary">Logging in...</Typography.Text>;
                    case "LOGGING_OUT":
                        return <Typography.Text type="secondary">Logging out...</Typography.Text>;
                    case "ERROR":
                        return <Typography.Text type="danger">Error: {loginState.error}</Typography.Text>;
                    case "NOT_LOGGED_IN":
                        return <Button size="small" ghost onClick={handleLoginClick}>Log in</Button>;
                }
            }}
        </Query>
    );
}

export default withApollo<{}>(withRouter(Auth));
