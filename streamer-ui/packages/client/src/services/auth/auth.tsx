import React from "react";
import {
    fetchRetry,
} from "../../services/fetch/fetch";
import { initialUserProfile, UserProfile } from "../../types/types";

// call `/profile` to get the user profile
export async function getProfile() {

    const url = "/profile";
    try {
        const result = await fetchRetry({
            url,
            options: {
                method: 'GET',
            } as RequestInit,
            numRetries: 1,
            timeout: 10000
        });

        if ( ! result.data ) throw new Error("empty result");

        return result;

    } catch (err) {
        throw err;
    }
}

export interface AuthProviderProps {
    profile: UserProfile | null,
}

export const AuthContext = React.createContext<AuthProviderProps>({profile: null});