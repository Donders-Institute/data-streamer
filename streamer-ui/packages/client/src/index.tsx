import React, { useState } from "react";
import { render } from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import * as serviceWorker from "./serviceWorker";

import App from "./app/App";
import { AuthProvider, IAuthContext } from "./services/auth/AuthContext";
import { Project, RcFile, InputValidationStatuses } from "./types/types";
import { UploaderProvider, IUploaderContext } from "./services/uploader/UploaderContext";

import "./index.less";

const Root: React.FC = () => {

    // Set auth context

    const signIn = (username: string, password: string, ipAddress: string) => {
        setAuthContext(state => (
            {
                ...state,
                username,
                password,
                ipAddress,
                isAuthenticated: true
            }
        ));
    };

    const signOut = () => {
        setAuthContext(state => (
            {
                ...state,
                username: "",
                password: "",
                ipAddress: "",
                isAuthenticated: false
            }
        ));
    };

    const [authContext, setAuthContext] = useState({
        username: "",
        password: "",
        ipAddress: "",
        isAuthenticated: false,
        signIn: signIn,
        signOut: signOut
    } as IAuthContext);

    // Set uploader context

    const setProjectList = (projectList: Project[]) => {
        setUploaderContext(state => ({ ...state, projectList }));
    };

    const setIsLoadingProjectList = (isLoadingProjectList: boolean) => {
        setUploaderContext(state => ({ ...state, isLoadingProjectList }));
    };

    const setSelectedProjectStatus = (selectedProjectStatus: (typeof InputValidationStatuses)[number]) => {
        setUploaderContext(state => ({ ...state, selectedProjectStatus }));
    };

    const setSelectedSubjectStatus = (selectedSubjectStatus: (typeof InputValidationStatuses)[number]) => {
        setUploaderContext(state => ({ ...state, selectedSubjectStatus }));
    };

    const setSelectedSessionStatus = (selectedSessionStatus: (typeof InputValidationStatuses)[number]) => {
        setUploaderContext(state => ({ ...state, selectedSessionStatus }));
    };

    const setSelectedDataTypeStatus = (selectedDataTypeStatus: (typeof InputValidationStatuses)[number]) => {
        setUploaderContext(state => ({ ...state, selectedDataTypeStatus }));
    };

    const setSelectedDataTypeOtherStatus = (selectedDataTypeOtherStatus: (typeof InputValidationStatuses)[number]) => {
        setUploaderContext(state => ({ ...state, selectedDataTypeOtherStatus }));
    };

    const setSelectedProjectValue = (selectedProjectValue: string) => {
        setUploaderContext(state => ({ ...state, selectedProjectValue }));
    };

    const setSelectedSubjectValue = (selectedSubjectValue: string) => {
        setUploaderContext(state => ({ ...state, selectedSubjectValue }));
    };

    const setSelectedSessionValue = (selectedSessionValue: string) => {
        setUploaderContext(state => ({ ...state, selectedSessionValue }));
    };

    const setSelectedDataTypeValue = (selectedDataTypeValue: string) => {
        setUploaderContext(state => ({ ...state, selectedDataTypeValue }));
    };

    const setIsSelectedProject = (isSelectedProject: boolean) => {
        setUploaderContext(state => ({ ...state, isSelectedProject }));
    };

    const setIsSelectedSubject = (isSelectedSubject: boolean) => {
        setUploaderContext(state => ({ ...state, isSelectedSubject }));
    };

    const setIsSelectedSession = (isSelectedSession: boolean) => {
        setUploaderContext(state => ({ ...state, isSelectedSession }));
    };

    const setIsSelectedDataType = (isSelectedDataType: boolean) => {
        setUploaderContext(state => ({ ...state, isSelectedDataType }));
    };

    const setIsSelectedDataTypeOther = (isSelectedDataTypeOther: boolean) => {
        setUploaderContext(state => ({ ...state, isSelectedDataTypeOther }));
    };

    const setFileList = (fileList: RcFile[]) => {
        setUploaderContext(state => ({ ...state, fileList }));
    };

    const setHasFilesSelected = (hasFilesSelected: boolean) => {
        setUploaderContext(state => ({ ...state, hasFilesSelected }));
    };

    const setFileListSummary = (fileListSummary: number) => {
        setUploaderContext(state => ({ ...state, fileListSummary }));
    };

    const [uploaderContext, setUploaderContext] = useState({
        projectList: [] as Project[],
        isLoadingProjectList: true,
        selectedProjectStatus: "" as (typeof InputValidationStatuses)[number],
        selectedSubjectStatus: "" as (typeof InputValidationStatuses)[number],
        selectedSessionStatus: "" as (typeof InputValidationStatuses)[number],
        selectedDataTypeStatus: "" as (typeof InputValidationStatuses)[number],
        selectedDataTypeOtherStatus: "" as (typeof InputValidationStatuses)[number],
        selectedProjectValue: "",
        selectedSubjectValue: "",
        selectedSessionValue: "",
        selectedDataTypeValue: "",
        isSelectedProject: false,
        isSelectedSubject: false,
        isSelectedSession: false,
        isSelectedDataType: false,
        isSelectedDataTypeOther: false,
        fileList: [] as RcFile[],
        fileListSummary: 0,
        hasFilesSelected: false,
        setProjectList: setProjectList,
        setIsLoadingProjectList: setIsLoadingProjectList,
        setSelectedProjectStatus: setSelectedProjectStatus,
        setSelectedSubjectStatus: setSelectedSubjectStatus,
        setSelectedSessionStatus: setSelectedSessionStatus,
        setSelectedDataTypeStatus: setSelectedDataTypeStatus,
        setSelectedDataTypeOtherStatus: setSelectedDataTypeOtherStatus,
        setSelectedProjectValue: setSelectedProjectValue,
        setSelectedSubjectValue: setSelectedSubjectValue,
        setSelectedSessionValue: setSelectedSessionValue,
        setSelectedDataTypeValue: setSelectedDataTypeValue,
        setIsSelectedProject: setIsSelectedProject,
        setIsSelectedSubject: setIsSelectedSubject,
        setIsSelectedSession: setIsSelectedSession,
        setIsSelectedDataType: setIsSelectedDataType,
        setIsSelectedDataTypeOther: setIsSelectedDataTypeOther,
        setFileList: setFileList,
        setHasFilesSelected: setHasFilesSelected,
        setFileListSummary: setFileListSummary
    } as IUploaderContext);

    return (
        <AuthProvider value={authContext}>
            <UploaderProvider value={uploaderContext}>
                <Router>
                    <App />
                </Router>
            </UploaderProvider>
        </AuthProvider>
    );
};

render(<Root />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
