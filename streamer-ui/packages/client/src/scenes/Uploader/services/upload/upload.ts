import { fetchRetry, basicAuthString } from "../../../../services/fetch/fetch";
import { UploadSession, ServerResponse } from "../../../../types/types";

// 1 GB = 1024 * 1024 * 1024 bytes = 1073741824 bytes
export const maxSizeLimitBytes = 1073741824;
export const maxSizeLimitAsString = "1 GB";

// 5 minutes = 5 * 60 * 1000 ms = 300000 ms
const uploadTimeout = 300000; // ms

const uploadNumRetries = 1;

// Initiate an upload session. Obtain a upload session id
export const fetchUploadBegin = async (username: string, password: string, uploadSession: UploadSession) => {

    let headers = new Headers(
        {
            'Content-Type': 'application/json',
            'Authorization': basicAuthString({ username, password })
        }
    );
    let body = JSON.stringify(uploadSession);

    let result: ServerResponse;
    try {
        result = await fetchRetry<ServerResponse>({
            url: "/upload/begin",
            options: {
                method: 'POST',
                credentials: 'include',
                headers,
                body
            } as RequestInit,
            numRetries: uploadNumRetries,
            timeout: uploadTimeout
        });
    } catch (err) {
        throw err;
    }

    // Double check result for errors
    if (result.error) {
        const errorMessage = result.error as string;
        throw new Error(errorMessage);
    }

    if (!result.data) {
        const errorMessage = "data is empty in result"
        throw new Error(errorMessage);
    }

    if (!result.data.data) {
        const errorMessage = "data.data is empty in result"
        throw new Error(errorMessage);
    }

    const uploadSessionId = result.data.data.uploadSessionId;
    return uploadSessionId as number;
};
