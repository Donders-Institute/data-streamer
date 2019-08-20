import * as React from "react";
import * as serviceWorker from "./serviceWorker";
import { ApolloProvider } from "react-apollo";
import { render } from "react-dom";
import { Provider } from "react-redux";
import { client } from "./components/Auth/resolvers";
import { PersistGate } from 'redux-persist/integration/react'
import configureStore from "./store";
import Oidc from "oidc-client";
import App from "./components/App";

Oidc.Log.logger = console;
Oidc.Log.level = Oidc.Log.DEBUG;

const { store, persistor } = configureStore();

const Root = () => {
    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <ApolloProvider client={client}>
                    <App />
                </ApolloProvider>
            </PersistGate>
        </Provider>
    );
};

render(<Root />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
