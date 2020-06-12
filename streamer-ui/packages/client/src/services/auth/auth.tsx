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
    AuthStatus,
    AuthState,
    AuthAction,
    AuthActionType,
    initialAuthState
} from "../../types/types";

function isNotEmpty(value: string) {
    return (value && value !== "");
};

async function signIn({
    username,
    password,
    signal
}: {
    username: string;
    password: string;
    signal: AbortSignal;
}) {
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
                body,
                signal
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

async function signOut({
    username,
    password,
    signal
}: {
    username: string;
    password: string;
    signal: AbortSignal;
}) {
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
                body,
                signal
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
        let mounted = true;
        const abortController = new AbortController();
        const signal = abortController.signal;

        const initiate = async () => {
            if (authState.status === AuthStatus.LoggingIn) {
                if (mounted) {
                    setIsLoading(true);
                }

                const username = authState.userProfile.username;
                const password = authState.userProfile.password;
                const displayName = null as string | null;

                let result: ServerResponse;
                try {
                    if (!skipAuth) {
                        result = await signIn({
                            username,
                            password,
                            signal
                        });

                        // Double check result for error
                        if (result.error && result.error !== "") {
                            throw new Error(result.error);
                        }
                    }

                    if (mounted) {
                        setIsLoading(false);

                        // Signin successful
                        authDispatch({
                            type: AuthActionType.SignedIn,
                            payload: {
                                ...authState,
                                isAuthenticated: true,
                                status: AuthStatus.LoggedIn,
                                userProfile: {
                                    username,
                                    displayName,
                                    password,
                                    isAuthenticated: true
                                } as UserProfile
                            } as AuthState
                        } as AuthAction);

                        setError(null);
                    }
                } catch (err) {
                    if (mounted) {
                        setError(err);
                    }
                }
            } else {
                if (mounted) {
                    setError(null);
                }
            }
        };
        initiate();

        return function cleanup() {
            abortController.abort();
            mounted = false;
        };
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
        let mounted = true;
        const abortController = new AbortController();
        const signal = abortController.signal;

        const initiate = async () => {
            if (authState.status === AuthStatus.LoggingOut) {

                if (mounted) {
                    setIsLoading(true);
                }

                const username = authState.userProfile.username;
                const password = authState.userProfile.password;

                let result: ServerResponse;
                try {
                    if (!skipAuth) {
                        result = await signOut({
                            username,
                            password,
                            signal
                        });

                        // Double check result for error
                        if (result.error && result.error !== "") {
                            throw new Error(result.error);
                        }
                    }

                    if (mounted) {
                        setIsLoading(false);

                        // Signout successful
                        authDispatch({
                            type: AuthActionType.NotSignedIn,
                            payload: { ...initialAuthState }
                        } as AuthAction);

                        setError(null);
                    }

                } catch (err) {
                    if (mounted) {
                        setError(err);
                    }
                }
            } else {
                if (mounted) {
                    setError(null);
                }
            }
        };
        initiate();

        return function cleanup() {
            abortController.abort();
            mounted = false;
        };
    }, [authState.status]);

    return [error, isLoading] as [Error | null, boolean];
};

// Custom hook to validate user input
export const useValidateAuthSelection = (authState: AuthState) => {
    const [isValid, setIsValid] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null as Error | null);

    useEffect(() => {
        let mounted = true;

        const validate = async () => {
            if (authState.status === AuthStatus.Selecting) {

                // Validate userrname and password
                const username = authState.userProfile.username;
                const password = authState.userProfile.password;

                const isValidUsername = isNotEmpty(username);
                const isValidPassword = isNotEmpty(password);

                if (mounted) {
                    setIsLoading(true);
                }

                try {
                    // Validate files selection
                    if (!isValidUsername || !isValidPassword) {
                        throw new Error("Invalid username and password");
                    }

                    if (mounted) {
                        setIsLoading(false);
                        setError(null);
                        setIsValid(true);
                    }
                } catch (err) {
                    if (mounted) {
                        setIsValid(false);
                        setError(err as Error | null);
                    }
                }
            }
        };
        validate();

        return function cleanup() {
            mounted = false;
        };
    }, [authState]);

    return [isValid, error, isLoading] as [boolean, Error | null, boolean];
};

