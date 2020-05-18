import React, { useState } from "react";
import { render } from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import * as serviceWorker from "./serviceWorker";

import App from "./app/App";
import { AuthProvider, IAuthContext, handleSignIn, handleSignOut } from "./services/auth/auth";
import { Project, RcFile, InputValidationStatuses, ServerResponse } from "./types/types";
import { UploaderProvider, IUploaderContext } from "./services/uploader/UploaderContext";

import "./index.less";

const Root: React.FC = () => {

    // Set auth context

    const signIn = async (username: string, password: string) => {
        let result: ServerResponse;
        try {
            result = await handleSignIn(username, password);
        } catch (err) {
            throw err;
        }

        setAuthContext(state => (
            {
                ...state,
                username,
                password,
                isAuthenticated: true
            }
        ));

        return result;
    };

    const signOut = async (username: string, password: string) => {
        let result: ServerResponse;
        try {
            result = await handleSignOut(username, password);
        } catch (err) {
            throw err;
        }

        setAuthContext(state => (
            {
                ...state,
                username: "",
                password: "",
                isAuthenticated: false
            }
        ));

        return result;
    };

    const [authContext, setAuthContext] = useState({
        username: "",
        password: "",
        isAuthenticated: false,
        signIn,
        signOut
    } as IAuthContext);

    // Set uploader context

    const setUploadSessionId = async (uploadSessionId: number) => {
        setUploaderContext(state => ({ ...state, uploadSessionId }));
    };

    const setTotalSizeBytes = async (totalSizeBytes: number) => {
        setUploaderContext(state => ({ ...state, totalSizeBytes }));
    };

    const setProjectList = async (projectList: Project[]) => {
        setUploaderContext(state => ({ ...state, projectList }));
    };

    const setIsLoadingProjectList = async (isLoadingProjectList: boolean) => {
        setUploaderContext(state => ({ ...state, isLoadingProjectList }));
    };

    const setSelectedProjectStatus = async (selectedProjectStatus: (typeof InputValidationStatuses)[number]) => {
        setUploaderContext(state => ({ ...state, selectedProjectStatus }));
    };

    const setSelectedSubjectStatus = async (selectedSubjectStatus: (typeof InputValidationStatuses)[number]) => {
        setUploaderContext(state => ({ ...state, selectedSubjectStatus }));
    };

    const setSelectedSessionStatus = async (selectedSessionStatus: (typeof InputValidationStatuses)[number]) => {
        setUploaderContext(state => ({ ...state, selectedSessionStatus }));
    };

    const setSelectedDataTypeStatus = async (selectedDataTypeStatus: (typeof InputValidationStatuses)[number]) => {
        setUploaderContext(state => ({ ...state, selectedDataTypeStatus }));
    };

    const setSelectedDataTypeOtherStatus = async (selectedDataTypeOtherStatus: (typeof InputValidationStatuses)[number]) => {
        setUploaderContext(state => ({ ...state, selectedDataTypeOtherStatus }));
    };

    const setSelectedProjectValue = async (selectedProjectValue: string) => {
        setUploaderContext(state => ({ ...state, selectedProjectValue }));
    };

    const setSelectedSubjectValue = async (selectedSubjectValue: string) => {
        setUploaderContext(state => ({ ...state, selectedSubjectValue }));
    };

    const setSelectedSessionValue = async (selectedSessionValue: string) => {
        setUploaderContext(state => ({ ...state, selectedSessionValue }));
    };

    const setSelectedDataTypeValue = async (selectedDataTypeValue: string) => {
        setUploaderContext(state => ({ ...state, selectedDataTypeValue }));
    };

    const setIsSelectedProject = async (isSelectedProject: boolean) => {
        setUploaderContext(state => ({ ...state, isSelectedProject }));
    };

    const setIsSelectedSubject = async (isSelectedSubject: boolean) => {
        setUploaderContext(state => ({ ...state, isSelectedSubject }));
    };

    const setIsSelectedSession = async (isSelectedSession: boolean) => {
        setUploaderContext(state => ({ ...state, isSelectedSession }));
    };

    const setIsSelectedDataType = async (isSelectedDataType: boolean) => {
        setUploaderContext(state => ({ ...state, isSelectedDataType }));
    };

    const setIsSelectedDataTypeOther = async (isSelectedDataTypeOther: boolean) => {
        setUploaderContext(state => ({ ...state, isSelectedDataTypeOther }));
    };

    const setFileList = async (fileList: RcFile[]) => {
        setUploaderContext(state => ({ ...state, fileList }));
    };

    const setHasFilesSelected = async (hasFilesSelected: boolean) => {
        setUploaderContext(state => ({ ...state, hasFilesSelected }));
    };

    const setFileListSummary = async (fileListSummary: number) => {
        setUploaderContext(state => ({ ...state, fileListSummary }));
    };

    const [uploaderContext, setUploaderContext] = useState({
        uploadSessionId: -1,
        totalSizeBytes: 0,
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
        setUploadSessionId,
        setTotalSizeBytes,
        setProjectList,
        setIsLoadingProjectList,
        setSelectedProjectStatus,
        setSelectedSubjectStatus,
        setSelectedSessionStatus,
        setSelectedDataTypeStatus,
        setSelectedDataTypeOtherStatus,
        setSelectedProjectValue,
        setSelectedSubjectValue,
        setSelectedSessionValue,
        setSelectedDataTypeValue,
        setIsSelectedProject,
        setIsSelectedSubject,
        setIsSelectedSession,
        setIsSelectedDataType,
        setIsSelectedDataTypeOther,
        setFileList,
        setHasFilesSelected,
        setFileListSummary
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
