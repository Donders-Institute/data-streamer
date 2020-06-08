import { useState, useEffect, Dispatch } from "react";

import {
    baseUrl,
    fetchRetry,
    fetchOnceRedirect,
    basicAuthString
} from "../../services/fetch/fetch";

import {
    UserProfile,
    ServerResponse,
    LoginStatus,
    AuthState,
    AuthAction,
    AuthActionType,
    initialAuthState
} from "../../types/types";

async function signIn(username: string, password: string) {

    const url = baseUrl() + "/login";
    const headers = new Headers(
        {
            'Content-Type': 'application/json',
            'Authorization': basicAuthString({ username, password })
        }
    );
    const body = JSON.stringify({});

    let result: ServerResponse;
    try {
        result = await fetchRetry({
            url,
            options: {
                method: 'POST',
                credentials: 'include',
                mode: 'cors',
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
    if (result.error && result.error !== "") {
        const errorMessage = result.error as string;
        throw new Error(errorMessage);
    }

    return result;
};

async function signOut(username: string, password: string) {

    const url = baseUrl() + "/logout";
    const headers = new Headers(
        {
            'Content-Type': 'application/json',
            'Authorization': basicAuthString({ username, password })
        }
    );
    const body = JSON.stringify({});

    try {
        await fetchOnceRedirect({
            url,
            options: {
                method: 'POST',
                credentials: 'include',
                mode: 'cors',
                headers,
                body
            } as RequestInit,
            timeout: 2000
        });
    } catch (err) {
        console.log(JSON.stringify(err));
        throw err;
    }

    const result = {
        data: "Successfully signed out",
        error: null
    } as ServerResponse;
    return result;
};

// Custom hook to handle sign in
export const useSigningIn = ({
    authState,
    authDispatch,
    skipAuth
}: {
    authState: AuthState;
    authDispatch: Dispatch<AuthAction>;
    skipAuth: boolean;
}) => {
    const [error, setError] = useState(null as Error | null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const initiate = async () => {
            if (authState.status === LoginStatus.LoggingIn) {
                setIsLoading(true);

                const username = authState.userProfile.username;
                const password = authState.userProfile.password;
                const displayName = null as string | null;

                let result: ServerResponse;
                try {
                    if (!skipAuth) {
                        result = await signIn(username, password);

                        // Double check result for error
                        if (result.error && result.error !== "") {
                            throw new Error(result.error);
                        }
                    }

                    setIsLoading(false);

                    // Signin successful
                    return authDispatch({
                        type: AuthActionType.SignedIn,
                        payload: {
                            ...authState,
                            isAuthenticated: true,
                            status: LoginStatus.LoggedIn,
                            userProfile: {
                                username,
                                displayName,
                                password,
                                isAuthenticated: true
                            } as UserProfile
                        } as AuthState
                    } as AuthAction);

                } catch (err) {
                    return setError(err);
                }
            }
        };
        initiate();
    }, [authState.status]);

    return [error, isLoading] as [Error | null, boolean];
};

// Custom hook to handle sign out
export const useSigningOut = ({
    authState,
    authDispatch,
    skipAuth
}: {
    authState: AuthState;
    authDispatch: Dispatch<AuthAction>;
    skipAuth: boolean;
}) => {
    const [error, setError] = useState(null as Error | null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const initiate = async () => {
            if (authState.status === LoginStatus.LoggingOut) {
                setIsLoading(true);

                const username = authState.userProfile.username;
                const password = authState.userProfile.password;

                let result: ServerResponse;
                try {
                    if (!skipAuth) {
                        result = await signOut(username, password);

                        // Double check result for error
                        if (result.error && result.error !== "") {
                            throw new Error(result.error);
                        }
                    }

                    setIsLoading(false);

                    // Signout successful
                    return authDispatch({
                        type: AuthActionType.NotSignedIn,
                        payload: { ...initialAuthState }
                    } as AuthAction);

                } catch (err) {
                    return setError(err);
                }
            }
        };
        initiate();
    }, [authState.status]);

    return [error, isLoading] as [Error | null, boolean];
};
