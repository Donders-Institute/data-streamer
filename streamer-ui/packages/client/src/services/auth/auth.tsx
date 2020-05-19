import React from "react";

import {
    fetchRetry,
    fetchOnceRedirect,
    basicAuthString
} from "../../services/fetch/fetch";

import { ServerResponse } from "../../types/types";

export interface IAuthContext {
    isAuthenticated: boolean,
    username: string,
    password: string,
    signIn: (username: string, password: string) => Promise<ServerResponse>,
    signOut: (username: string, password: string) => Promise<ServerResponse>
}

export const AuthContext = React.createContext<IAuthContext | null>(null);
export const AuthProvider = AuthContext.Provider;
export const AuthConsumer = AuthContext.Consumer;

export async function handleSignIn(username: string, password: string) {
    let headers = new Headers(
        {
            'Content-Type': 'application/json',
            'Authorization': basicAuthString({ username, password })
        }
    );
    let body = JSON.stringify({});

    let result: ServerResponse;
    try {
        result = await fetchRetry({
            url: "/login",
            options: {
                method: 'POST',
                credentials: 'include',
                headers,
                body
            } as RequestInit,
            numRetries: 1,
            timeout: 2000
        });
    } catch (err) {
        throw err;
    }

    // Double check result for errors
    if (result.error) {
        const errorMessage = result.error as string;
        throw new Error(errorMessage);
    }

    return result;
};

export async function handleSignOut(username: string, password: string) {
    let headers = new Headers(
        {
            'Content-Type': 'application/json',
            'Authorization': basicAuthString({ username, password })
        }
    );
    let body = JSON.stringify({});

    try {
        await fetchOnceRedirect({
            url: "/logout",
            options: {
                method: 'POST',
                credentials: 'include',
                headers,
                body
            } as RequestInit,
            timeout: 2000
        });
    } catch (err) {
        throw err;
    }

    const result = {
        data: "Successfully signed out",
        error: null
    } as ServerResponse;
    return result;
};
