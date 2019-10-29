import React, { useContext } from "react";

export interface IAuthContext {
    isAuthenticated: boolean,
    username: string,
    password: string,
    ipAddress: string,
    authenticate: (username: string, password: string, ipAddress: string) => void,
    signout: () => void
}

const AuthContext = React.createContext<IAuthContext | null>(null);

const AuthProvider = AuthContext.Provider;

const AuthConsumer = AuthContext.Consumer;

export { AuthContext, AuthProvider, AuthConsumer };
