export interface ServerResponse {
    error: string | null;
    data: string | null;
};

export interface RcFile extends File {
    uid: string;
    readonly lastModifiedDate: Date;
    readonly webkitRelativePath: string;
}

export interface ValidatedFile {
    filename: string;
    fileExists: boolean;
}

export interface Project {
    id: number;
    number: string;
}

export interface UploadSession {
    username: string;
    ipAddress: string;
    projectNumber: string;
    subjectLabel: string;
    sessionLabel: string;
    dataType: string;
}

export type SelectOption = {
    key: string;
}

export type ProjectList = Project[] | null;

export interface UploadWork {
    newTotalSizeBytes: number;
    work: Promise<unknown>[];
    uploadSessionId: number;
    uploadSession: UploadSession;
}

export declare const ValidateStatuses: ["success", "warning", "error", "validating", ""];
