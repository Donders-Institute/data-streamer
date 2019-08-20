import ApolloClient, { InMemoryCache } from "apollo-boost";
import gql from "graphql-tag";
import { ApolloCache } from "apollo-cache";
import { LoginStatus, EndLoginErrorVariables, EndLoginSuccessVariables } from "./gqlTypes";

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

export const client = new ApolloClient<CacheShape>({
    cache: new InMemoryCache(),
    uri: "http://dccn-dk001.dccn.nl:5060/v1/graphql",
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
                let loginState: LoginState = {
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
