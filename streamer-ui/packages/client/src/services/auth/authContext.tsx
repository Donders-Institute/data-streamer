import React from "react";
import { AuthAction, AuthState, initialAuthState } from "../../types/types";

export interface AuthProviderProps {
    state: AuthState;
    updateState?: (action: AuthAction) => void;
}

export const AuthContext = React.createContext<AuthProviderProps>({state: initialAuthState});