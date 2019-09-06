import { UserManager } from "oidc-client";
import { useContext, FC } from "react";
import React from "react";

export interface AuthProviderProps {
    userManager: UserManager;
}

const Context = React.createContext<UserManager | null>(null);

export const useUserManager = (): UserManager => {
    const userManager = useContext(Context);
    if (!userManager) {
        throw new Error("No AuthProvider found");
    }
    return userManager;
};

export const AuthProvider: FC<AuthProviderProps> = ({ userManager, children }) => (
    <Context.Provider value={userManager}>
        {children}
    </Context.Provider>
);
