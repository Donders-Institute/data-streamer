import { ApolloClient } from "apollo-client";
import { InMemoryCache, NormalizedCacheObject } from "apollo-cache-inmemory";
import { HttpLink } from "apollo-link-http";
import { ApolloLink } from "apollo-link";
import * as ApolloLinkError from "apollo-link-error";
import * as ApolloLinkContext from "apollo-link-context";
import gql from "graphql-tag";
import { ApolloCache } from "apollo-cache";
import { LoginStatus, EndLoginErrorVariables, EndLoginSuccessVariables } from "./gqlTypes";
import { UserManager } from "oidc-client";

const typeDefs = gql`
    extend type query_root {
        loginState: LoginState!
    }

    extend type mutation_root {
        startLogin: LoginState!
        endLoginSuccess(userName: String!, displayName: String): LoginState!
        endLoginError(error: String!): LoginState!
        startLogout: LoginState!
    }

    type LoginState {
        status: LoginStatus!
        user: UserInfo
        error: String
    }

    type UserInfo {
        userName: String!
        displayName: String
    }

    enum LoginStatus {
        NOT_LOGGED_IN
        LOGGING_IN
        LOGGING_OUT
        LOGGED_IN
        ERROR
    }
`;

interface CacheShape {
    loginState: LoginState;
}

interface LoginState {
    __typename: "LoginState";
    status: LoginStatus;
    user: UserInfo | null;
    error: string | null;
}

interface UserInfo {
    __typename: "UserInfo";
    userName: string;
    displayName: string | null;
}

const configureApolloClient = (uri: string, userManager: UserManager): ApolloClient<NormalizedCacheObject> => {
    const authLink = ApolloLinkContext.setContext(async (_operation, context: { headers?: Record<string, string> }) => {
        const user = await userManager.getUser();
        const headers = context.headers || {};
        return {
            ...context,
            headers: {
                ...headers,
                authorization: user ? `Bearer ${user.access_token}` : null
            }
        };
    });

    const errorLink = ApolloLinkError.onError(({ graphQLErrors, networkError }) => {
        if (graphQLErrors) {
            graphQLErrors.forEach(({ message, locations, path }) => {
                console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`);
            });
        }
        if (networkError) {
            console.log(`[Network error]: ${networkError}`);
        }
    });

    const httpLink = new HttpLink({
        uri
    });

    const client = new ApolloClient({
        link: ApolloLink.from([
            authLink,
            errorLink,
            httpLink
        ]),
        cache: new InMemoryCache(),
        typeDefs,
        resolvers: {
            Mutation: {
                startLogin: (_rootValue, _args, { cache }: { cache: ApolloCache<CacheShape> }) => {
                    const loginState: LoginState = {
                        __typename: "LoginState",
                        status: LoginStatus.LOGGING_IN,
                        user: null,
                        error: null
                    };
                    cache.writeData<CacheShape>({
                        data: {
                            loginState
                        }
                    });
                    return loginState;
                },
                endLoginSuccess: (_rootValue, { userName, displayName }: EndLoginSuccessVariables, { cache }: { cache: ApolloCache<CacheShape> }) => {
                    const loginState: LoginState = {
                        __typename: "LoginState",
                        status: LoginStatus.LOGGED_IN,
                        user: {
                            __typename: "UserInfo",
                            userName,
                            displayName: displayName || null
                        },
                        error: null
                    };
                    cache.writeData<CacheShape>({
                        data: {
                            loginState
                        }
                    });
                    return loginState;
                },
                endLoginError: (_rootValue, { error }: EndLoginErrorVariables, { cache }: { cache: ApolloCache<CacheShape> }) => {
                    const loginState: LoginState = {
                        __typename: "LoginState",
                        status: LoginStatus.ERROR,
                        user: null,
                        error
                    };
                    cache.writeData<CacheShape>({
                        data: {
                            loginState
                        }
                    });
                    return loginState;
                },
                startLogout: (_rootValue, _args, { cache }: { cache: ApolloCache<CacheShape> }) => {
                    const loginState: LoginState = {
                        __typename: "LoginState",
                        status: LoginStatus.LOGGING_OUT,
                        user: null,
                        error: null
                    };
                    cache.writeData<CacheShape>({
                        data: {
                            loginState
                        }
                    });
                    return loginState;
                }
            }
        }
    });

    client.writeData<CacheShape>({
        data: {
            loginState: {
                __typename: "LoginState",
                status: LoginStatus.NOT_LOGGED_IN,
                user: null,
                error: null
            }
        }
    });

    return client;
};

export default configureApolloClient;
