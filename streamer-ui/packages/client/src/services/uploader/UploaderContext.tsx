import React from "react";

import { RcFile, Project, InputValidationStatuses } from "../../types/types";

export interface IUploaderContext {
    uploadSessionId: number;
    totalSizeBytes: number;
    projectList: Project[];
    isLoadingProjectList: boolean;
    selectedProjectStatus: (typeof InputValidationStatuses)[number];
    selectedSubjectStatus: (typeof InputValidationStatuses)[number];
    selectedSessionStatus: (typeof InputValidationStatuses)[number];
    selectedDataTypeStatus: (typeof InputValidationStatuses)[number];
    selectedDataTypeOtherStatus: (typeof InputValidationStatuses)[number];
    selectedProjectValue: string;
    selectedSubjectValue: string;
    selectedSessionValue: string;
    selectedDataTypeValue: string;
    isSelectedProject: boolean;
    isSelectedSubject: boolean;
    isSelectedSession: boolean;
    isSelectedDataType: boolean;
    isSelectedDataTypeOther: boolean;
    fileList: RcFile[];
    fileListSummary: number;
    hasFilesSelected: boolean;
    setUploadSessionId: (uploadSessionId: number) => Promise<void>;
    setTotalSizeBytes: (totalSizeBytes: number) => Promise<void>;
    setProjectList: (projectList: Project[]) => Promise<void>;
    setIsLoadingProjectList: (isLoadingProjectList: boolean) => Promise<void>;
    setSelectedProjectStatus: (selectedProjectStatus: (typeof InputValidationStatuses)[number]) => Promise<void>;
    setSelectedSubjectStatus: (selectedSubjectStatus: (typeof InputValidationStatuses)[number]) => Promise<void>;
    setSelectedSessionStatus: (selectedSessionStatus: (typeof InputValidationStatuses)[number]) => Promise<void>;
    setSelectedDataTypeStatus: (selectedDataTypeStatus: (typeof InputValidationStatuses)[number]) => Promise<void>;
    setSelectedDataTypeOtherStatus: (selectedDataTypeOtherStatus: (typeof InputValidationStatuses)[number]) => Promise<void>;
    setSelectedProjectValue: (selectedProjectValue: string) => Promise<void>;
    setSelectedSubjectValue: (selectedSubjectValue: string) => Promise<void>;
    setSelectedSessionValue: (selectedSessionValue: string) => Promise<void>;
    setSelectedDataTypeValue: (selectedDataTypeValue: string) => Promise<void>;
    setIsSelectedProject: (isSelectedProject: boolean) => Promise<void>;
    setIsSelectedSubject: (isSelectedSubject: boolean) => Promise<void>;
    setIsSelectedSession: (isSelectedSession: boolean) => Promise<void>;
    setIsSelectedDataType: (isSelectedDataType: boolean) => Promise<void>;
    setIsSelectedDataTypeOther: (isSelectedDataTypeOther: boolean) => Promise<void>;
    setFileList: (fileList: RcFile[]) => Promise<void>;
    setHasFilesSelected: (hasFilesSelected: boolean) => Promise<void>;
    setFileListSummary: (fileListSummary: number) => Promise<void>;
}

const UploaderContext = React.createContext<IUploaderContext | null>(null);

const UploaderProvider = UploaderContext.Provider;

const UploaderConsumer = UploaderContext.Consumer;

export { UploaderContext, UploaderProvider, UploaderConsumer };
