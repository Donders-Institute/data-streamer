// import gql from "graphql-tag";
import React, { useEffect } from "react";
import { useQuery, useMutation } from "@apollo/react-hooks";
import { Button, Typography } from "antd";
import {
    Route,
    Switch,
    withRouter,
    RouteComponentProps,
    Redirect
} from "react-router-dom";
import {
    GetLoginState,
    StartLogout,
    StartLogin,
    EndLoginErrorVariables,
    EndLoginSuccessVariables,
    EndLoginSuccess,
    EndLoginError
} from "../../gqlTypes";
import { useUserManager } from "./AuthContext";
// import { DocumentNode } from "graphql";

// To be removed
export const LOGGEDIN = true;

// const GET_LOGIN_STATE: DocumentNode = gql`
//   query GetLoginState {
//     loginState @client {
//       status
//       user {
//         userName
//         displayName
//       }
//       error
//     }
//   }
// `;

// const START_LOGIN: DocumentNode = gql`
//   mutation StartLogin {
//     startLogin @client {
//       status
//     }
//   }
// `;

// const END_LOGIN_SUCCESS: DocumentNode = gql`
//   mutation EndLoginSuccess($userName: String!, $displayName: String) {
//     endLoginSuccess(userName: $userName, displayName: $displayName) @client {
//       status
//     }
//   }
// `;

// const END_LOGIN_ERROR: DocumentNode = gql`
//   mutation EndLoginError($error: String!) {
//     endLoginError(error: $error) @client {
//       status
//     }
//   }
// `;

// const START_LOGOUT: DocumentNode = gql`
//   mutation StartLogout {
//     startLogout @client {
//       status
//     }
//   }
// `;

type AuthProps = RouteComponentProps;

const Auth: React.FC<AuthProps> = ({ history }) => {
    // const userManager = useUserManager();

    // const options = {
    //   ignoreResults: true
    // };
    // const [startLogin] = useMutation<StartLogin>(START_LOGIN, options);
    // const [startLogout] = useMutation<StartLogout>(START_LOGOUT, options);
    // const [endLoginSuccess] = useMutation<
    //   EndLoginSuccess,
    //   EndLoginSuccessVariables
    // >(END_LOGIN_SUCCESS, options);
    // const [endLoginError] = useMutation<EndLoginError, EndLoginErrorVariables>(
    //   END_LOGIN_ERROR,
    //   options
    // );

    // useEffect(
    //   () =>
    //     void (async () => {
    //       const isCallback = history.location.pathname === "/callback";
    //       if (isCallback) {
    //         await startLogin();
    //       }
    //       try {
    //         const user = isCallback
    //           ? await userManager.signinRedirectCallback()
    //           : await userManager.getUser();

    //         if (user) {
    //           await endLoginSuccess({
    //             variables: {
    //               userName: user.profile.sub,
    //               displayName: user.profile.name || null
    //             }
    //           });
    //         }
    //       } catch (error) {
    //         if (error instanceof Error) {
    //           await endLoginError({
    //             variables: {
    //               error: error.message
    //             }
    //           });
    //         } else {
    //           throw error;
    //         }
    //       }
    //     }),
    //   [history, startLogin, endLoginSuccess, endLoginError, userManager]
    // );

    // const { loading, error, data } = useQuery<GetLoginState>(GET_LOGIN_STATE, {
    //   fetchPolicy: "cache-only"
    // });

    // if (error) {
    //   return <Typography.Text type="danger">Error: {error}</Typography.Text>;
    // }
    // if (loading) {
    //   return <Typography.Text type="secondary">Loading...</Typography.Text>;
    // }

    // const { loginState } = data!;
    // switch (loginState.status) {
    //   case "LOGGED_IN": {
    //     const handleLogoutClick = () =>
    //       void (async () => {
    //         await startLogout();
    //         await userManager.signoutRedirect();
    //       })();
    //     return (
    //       <Switch>
    //         <Redirect from="/callback" to="/" exact />
    //         <Route
    //           render={() => (
    //             <Button size="small" ghost onClick={handleLogoutClick}>
    //               Log out
    //             </Button>
    //           )}
    //         />
    //       </Switch>
    //     );
    //   }
    //   case "LOGGING_IN":
    //     return <Typography.Text type="secondary">Logging in...</Typography.Text>;
    //   case "LOGGING_OUT":
    //     return <Typography.Text type="secondary">Logging out...</Typography.Text>;
    //   case "ERROR":
    //     return (
    //       <Typography.Text type="danger">
    //         Error: {loginState.error}
    //       </Typography.Text>
    //     );
    //   default: {
    //     const handleLoginClick = () =>
    //       void (async () => {
    //         await startLogin();
    //         await userManager.signinRedirect();
    //       })();
    //     return (
    //       <Button size="small" ghost onClick={handleLoginClick}>
    //         Log in
    //       </Button>
    //     );
    //   }
    // }

    return <div></div>;
};

export default withRouter(Auth);
