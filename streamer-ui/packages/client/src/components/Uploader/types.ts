export interface RcFile extends File {
    uid: string;
    readonly lastModifiedDate: Date;
    readonly webkitRelativePath: string;
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

export declare const ValidateStatuses: ["success", "warning", "error", "validating", ""];
