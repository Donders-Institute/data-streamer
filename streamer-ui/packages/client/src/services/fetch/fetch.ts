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
        fetch(url, options).then(response => {
            if (!response.ok) {
                return new Promise<string>((_, reject) =>
                    reject(new Error(response.statusText))
                )
            }
            return new Promise<string>((resolve, _) =>
                resolve(response.text())
            )

        }),
        new Promise<string>((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), timeout)
        )
    ]);
}

// Fetch once JSON with timeout in milliseconds
export async function fetchOnce<T>({
    url,
    options,
    timeout
}: {
    url: string;
    options: RequestInit;
    timeout: number
}): Promise<T> {
    return Promise.race([
        fetch(url, options).then(response => {
            if (!response.ok) {
                return new Promise<T>((_, reject) =>
                    reject(new Error(response.statusText))
                )
            }
            return new Promise<T>((resolve, _) =>
                resolve(response.json())
            )
        }),
        new Promise<T>((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), timeout)
        )
    ]);
}

// Fetch retry JSON with number of retries and timeout in milliseconds
export async function fetchRetry<T>({
    url,
    options,
    numRetries,
    timeout
}: {
    url: string;
    options: RequestInit;
    numRetries: number;
    timeout: number
}): Promise<T> {
    try {
        return await fetchOnce({ url, options, timeout });
    } catch (error) {
        if (numRetries === 1) throw error;
        return await fetchRetry({ url, options, numRetries: numRetries - 1, timeout });
    }
}

export function basicAuthString({ username, password }: { username: string; password: string; }): string {
    const b64encoded = btoa(`${username}:${password}`);
    return `Basic ${b64encoded}`;
}