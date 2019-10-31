import React from "react";

import { RcFile, ProjectList, ValidateStatuses } from "./types";

export interface IUploaderContext {
    projectList: ProjectList;
    isLoadingProjectList: boolean;
    selectedProjectStatus: (typeof ValidateStatuses)[number];
    selectedSubjectStatus: (typeof ValidateStatuses)[number];
    selectedSessionStatus: (typeof ValidateStatuses)[number];
    selectedDataTypeStatus: (typeof ValidateStatuses)[number];
    selectedDataTypeOtherStatus: (typeof ValidateStatuses)[number];
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
    setProjectList: (projectList: ProjectList) => void;
    setIsLoadingProjectList: (isLoadingProjectList: boolean) => void;
    setSelectedProjectStatus: (selectedProjectStatus: (typeof ValidateStatuses)[number]) => void;
    setSelectedSubjectStatus: (selectedSubjectStatus: (typeof ValidateStatuses)[number]) => void;
    setSelectedSessionStatus: (selectedSessionStatus: (typeof ValidateStatuses)[number]) => void;
    setSelectedDataTypeStatus: (selectedDataTypeStatus: (typeof ValidateStatuses)[number]) => void;
    setSelectedDataTypeOtherStatus: (selectedDataTypeOtherStatus: (typeof ValidateStatuses)[number]) => void;
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
