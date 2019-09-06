import React, { FC } from "react";
import * as serviceWorker from "./serviceWorker";
import { ApolloProvider } from "@apollo/react-hooks";
import { render } from "react-dom";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import configureStore from "./store";
import Oidc, { UserManager } from "oidc-client";
import App from "./components/App";
import configureApolloClient from "./apollo";

import "./index.less";
import { AuthProvider } from "./components/Auth/AuthContext";

Oidc.Log.logger = console;
Oidc.Log.level = Oidc.Log.DEBUG;

const { store, persistor } = configureStore();

const baseUrl = window.location.origin;
const userManager = new UserManager({
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
const apolloClient = configureApolloClient(
    "http://dccn-pl001.dccn.nl:5060/v1/graphql",
    userManager
);

const Root: FC = () => {
    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <AuthProvider userManager={userManager}>
                    <ApolloProvider client={apolloClient}>
                        <App />
                    </ApolloProvider>
                </AuthProvider>
            </PersistGate>
        </Provider>
    );
};

render(<Root />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
