import { ServerResponse } from "../../types/types";

export const baseURL = "/api";

// Fetch once text redirect with timeout in milliseconds
export async function fetchOnceRedirect({
    url,
    options,
    timeout
}: {
    url: string;
    options: RequestInit;
    timeout: number
}): Promise<string> {
    return Promise.race([
        // Fetch route
        fetch(url, options).then((response) => {
            return response.text() as Promise<string>;
        }).catch((err) => {
            throw err;
        }),
        // Timer route
        new Promise<string>((_, reject) =>
            setTimeout(() => reject(new Error(`timeout of ${timeout.toString()} ms exceeded`)), timeout)
        ).catch((err) => { throw err; })
    ]);
};

// Fetch once JSON with timeout in milliseconds
export async function fetchOnce({
    url,
    options,
    timeout
}: {
    url: string;
    options: RequestInit;
    timeout: number
}): Promise<ServerResponse> {
    return Promise.race([
        // Fetch route
        fetch(url, options).then((response) => {
            return response.json() as Promise<ServerResponse>;
        }).catch((err) => {
            throw err;
        }),
        // Timer route
        new Promise<ServerResponse>((_, reject) => {
            const result = {
                data: null,
                error: `timeout of ${timeout.toString()} ms exceeded`
            } as ServerResponse;
            setTimeout(() => reject(result), timeout);
        }
        ).catch((err) => {
            throw err;
        })
    ]);
};

// Fetch retry JSON with number of retries and timeout in milliseconds
export async function fetchRetry({
    url,
    options,
    numRetries,
    timeout
}: {
    url: string;
    options: RequestInit;
    numRetries: number;
    timeout: number
}): Promise<ServerResponse> {
    try {
        return await fetchOnce({ url, options, timeout });
    } catch (error) {
        if (numRetries === 1) throw error;
        return await fetchRetry({ url, options, numRetries: numRetries - 1, timeout });
    }
};

export function basicAuthString({ username, password }: { username: string; password: string; }): string {
    const b64encoded = btoa(`${username}:${password}`);
    return `Basic ${b64encoded}`;
};