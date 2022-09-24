import {
    baseURL,
    fetchRetry,
    fetchOnceRedirect,
    basicAuthString
} from "../../services/fetch/fetch";

import {
    ServerResponse
} from "../../types/types";

// call `/login` interface for user login
export async function signIn({
    username,
    password,
    signal
}: {
    username: string;
    password: string;
    signal: AbortSignal;
}) {
    const url = baseURL + "/login";
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
            timeout: 10000
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

// call `/logout` interface for user logout
export async function signOut({
    username,
    password,
    signal
}: {
    username: string;
    password: string;
    signal: AbortSignal;
}) {
    const url = baseURL + "/logout";
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
            timeout: 10000
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