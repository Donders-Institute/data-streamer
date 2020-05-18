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
    setUploadSessionId: (uploadSessionId: number) => void;
    setTotalSizeBytes: (totalSizeBytes: number) => void;
    setProjectList: (projectList: Project[]) => void;
    setIsLoadingProjectList: (isLoadingProjectList: boolean) => void;
    setSelectedProjectStatus: (selectedProjectStatus: (typeof InputValidationStatuses)[number]) => void;
    setSelectedSubjectStatus: (selectedSubjectStatus: (typeof InputValidationStatuses)[number]) => void;
    setSelectedSessionStatus: (selectedSessionStatus: (typeof InputValidationStatuses)[number]) => void;
    setSelectedDataTypeStatus: (selectedDataTypeStatus: (typeof InputValidationStatuses)[number]) => void;
    setSelectedDataTypeOtherStatus: (selectedDataTypeOtherStatus: (typeof InputValidationStatuses)[number]) => void;
    setSelectedProjectValue: (selectedProjectValue: string) => void;
    setSelectedSubjectValue: (selectedSubjectValue: string) => void;
    setSelectedSessionValue: (selectedSessionValue: string) => void;
    setSelectedDataTypeValue: (selectedDataTypeValue: string) => void;
    setIsSelectedProject: (isSelectedProject: boolean) => void;
    setIsSelectedSubject: (isSelectedSubject: boolean) => void;
    setIsSelectedSession: (isSelectedSession: boolean) => void;
    setIsSelectedDataType: (isSelectedDataType: boolean) => void;
    setIsSelectedDataTypeOther: (isSelectedDataTypeOther: boolean) => void;
    setFileList: (fileList: RcFile[]) => void;
    setHasFilesSelected: (hasFilesSelected: boolean) => void;
    setFileListSummary: (fileListSummary: number) => void;
}

const UploaderContext = React.createContext<IUploaderContext | null>(null);

const UploaderProvider = UploaderContext.Provider;

const UploaderConsumer = UploaderContext.Consumer;

export { UploaderContext, UploaderProvider, UploaderConsumer };
