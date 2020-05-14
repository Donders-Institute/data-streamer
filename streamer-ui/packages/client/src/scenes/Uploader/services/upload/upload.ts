import { fetchRetry, basicAuthString } from "../../../../services/fetch/fetch";

import {
    UploadSession,
    ServerResponse,
    Structure,
    RcFile,
    ValidateFileResult,
    ValidationResult,
    AddFileResult,
    FinalizeResult
} from "../../../../types/types";

// 1 GB = 1024 * 1024 * 1024 bytes = 1073741824 bytes
export const maxSizeLimitBytes = 1073741824;
export const maxSizeLimitAsString = "1 GB";

// 5 minutes = 5 * 60 * 1000 ms = 300000 ms
export const uploadTimeout = 300000; // ms

const uploadNumRetries = 1;

export const detectFile = (file: RcFile) => {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.onloadstart = () => {
            // is file
            resolve(true);
        };
        reader.onerror = (e) => {
            // is directory
            resolve(false);
        };
        reader.readAsArrayBuffer(file);
    });
};

// Initiate an upload session. Obtain a upload session id
const initiate = async (
    username: string,
    password: string,
    projectNumber: string,
    subjectLabel: string,
    sessionLabel: string,
    dataType: string
) => {
    const headers = new Headers(
        {
            'Content-Type': 'application/json',
            'Authorization': basicAuthString({ username, password })
        }
    );

    const structure = {
        projectNumber,
        subjectLabel,
        sessionLabel,
        dataType
    } as Structure

    const body = JSON.stringify(structure);

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

    // if (!result.data.data) {
    //     const errorMessage = "data.data is empty in result"
    //     throw new Error(errorMessage);
    // }

    // const uploadSessionId = result.data.data.uploadSessionId;
    return 0; // uploadSessionId as number;
};

// Validate a single file to be uploaded
const validateFile = async (
    username: string,
    password: string,
    uploadSession: UploadSession,
    file: RcFile
) => {
    const headers = new Headers(
        {
            'Content-Type': "multipart/form-data",
            'Authorization': basicAuthString({ username, password })
        }
    );

    let formData = new FormData();
    formData.append("uploadSessionId", uploadSession.uploadSessionId.toLocaleString());
    formData.append("projectNumber", uploadSession.projectNumber);
    formData.append("subjectLabel", uploadSession.subjectLabel);
    formData.append("sessionLabel", uploadSession.sessionLabel);
    formData.append("dataType", uploadSession.dataType);

    formData.append("filename", file.name);
    formData.append("filesize", file.size.toLocaleString());
    formData.append("uid", file.uid);

    formData.append("files", file);

    let result: ServerResponse;
    try {
        result = await fetchRetry<ServerResponse>({
            url: "/upload/validatefile",
            options: {
                method: 'POST',
                credentials: 'include',
                headers,
                body: formData
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

    const validateFileResult = result.data as ValidateFileResult;
    return validateFileResult;
};

// Add a file to be uploaded
const addFile = async (
    username: string,
    password: string,
    uploadSession: UploadSession,
    file: RcFile
) => {
    const headers = new Headers(
        {
            'Content-Type': "multipart/form-data",
            'Authorization': basicAuthString({ username, password })
        }
    );

    let formData = new FormData();
    formData.append("uploadSessionId", uploadSession.uploadSessionId.toLocaleString());
    formData.append("projectNumber", uploadSession.projectNumber);
    formData.append("subjectLabel", uploadSession.subjectLabel);
    formData.append("sessionLabel", uploadSession.sessionLabel);
    formData.append("dataType", uploadSession.dataType);

    formData.append("filename", file.name);
    formData.append("filesize", file.size.toLocaleString());
    formData.append("uid", file.uid);

    formData.append("files", file);

    let result: ServerResponse;
    try {
        result = await fetchRetry<ServerResponse>({
            url: "/upload/addfile",
            options: {
                method: 'POST',
                credentials: 'include',
                headers,
                body: formData
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

    const addFileResult = result.data as AddFileResult;
    return addFileResult;
};

export const prepare = async (
    username: string,
    password: string,
    ipAddress: string,
    projectNumber: string,
    subjectLabel: string,
    sessionLabel: string,
    dataType: string,
    fileList: RcFile[]
) => {

    let uploadSessionId: number;
    try {
        uploadSessionId = await initiate(
            username,
            password,
            projectNumber,
            subjectLabel,
            sessionLabel,
            dataType);
    } catch (err) {
        throw err;
    }

    // Derive the total size of the files to be uploaded in bytes
    let totalSizeBytes = 0;
    fileList.forEach((file: RcFile) => {
        totalSizeBytes += file.size;
    });

    return {
        uploadSessionId,
        username,
        ipAddress,
        projectNumber,
        subjectLabel,
        sessionLabel,
        dataType,
        totalSizeBytes
    } as UploadSession;
}

// Check for existing project storage folder and existing files
export const validate = async (
    username: string,
    password: string,
    uploadSession: UploadSession,
    fileList: RcFile[]
) => {
    let validationResult = {
        existingFiles: [] as string[],
        emptyFiles: [] as string[],
        validatedFiles: [] as ValidateFileResult[]
    } as ValidationResult;

    fileList.forEach(async (file: RcFile) => {
        let validateFileResult: ValidateFileResult;
        try {
            validateFileResult = await validateFile(
                username,
                password,
                uploadSession,
                file);
        } catch (err) {
            throw err;
        }

        // Gather existing files
        if (validateFileResult.fileExists) {
            validationResult.existingFiles.push(file.name);
        }

        // Gather empty files
        if (validateFileResult.fileIsEmpty) {
            validationResult.emptyFiles.push(file.name);
        }
    });

    return validationResult;
}
