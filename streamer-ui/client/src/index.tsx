import React, { useState, useEffect } from "react";
import { render } from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import * as serviceWorker from "./serviceWorker";

import App from "./components/App";
import { AuthProvider } from "./components/Auth/AuthContext";
import { Project, RcFile, ValidateStatuses } from "./components/Uploader/types";
import { UploaderProvider } from "./components/Uploader/UploaderContext";
import { fetchDummyProjectList } from "./components/Uploader/fetch";

import "./index.less";
import { booleanLiteral } from "@babel/types";

const Root: React.FC = () => {

    const [projectList, setProjectList] = useState([] as Project[]);
    const [isLoadingProjectList, setIsLoadingProjectList] = useState(true);

    // Set auth context

    const authenticate = (username: string, password: string, ipAddress: string) => {
        setAuthContext(state => (
            {
                ...state,
                username: username,
                password: password,
                ipAddress: ipAddress,
                isAuthenticated: true
            }
        ));
    };

    const signout = () => {
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
        authenticate: authenticate,
        signout: signout
    });

    // Set uploader context

    const setSelectedProjectStatus = (selectedProjectStatus: (typeof ValidateStatuses)[number]) => {
        setUploaderContext(state => ({ ...state, selectedProjectStatus: selectedProjectStatus }));
    }

    const setSelectedSubjectStatus = (selectedSubjectStatus: (typeof ValidateStatuses)[number]) => {
        setUploaderContext(state => ({ ...state, selectedSubjectStatus: selectedSubjectStatus }));
    }

    const setSelectedSessionStatus = (selectedSessionStatus: (typeof ValidateStatuses)[number]) => {
        setUploaderContext(state => ({ ...state, selectedSessionStatus: selectedSessionStatus }));
    }

    const setSelectedDataTypeStatus = (selectedDataTypeStatus: (typeof ValidateStatuses)[number]) => {
        setUploaderContext(state => ({ ...state, selectedDataTypeStatus: selectedDataTypeStatus }));
    }

    const setSelectedDataTypeOtherStatus = (selectedDataTypeOtherStatus: (typeof ValidateStatuses)[number]) => {
        setUploaderContext(state => ({ ...state, selectedDataTypeOtherStatus: selectedDataTypeOtherStatus }));
    }

    const setSelectedProjectValue = (selectedProjectValue: string) => {
        setUploaderContext(state => ({ ...state, selectedProjectValue: selectedProjectValue }));
    }

    const setSelectedSubjectValue = (selectedSubjectValue: string) => {
        setUploaderContext(state => ({ ...state, selectedSubjectValue: selectedSubjectValue }));
    }

    const setSelectedSessionValue = (selectedSessionValue: string) => {
        setUploaderContext(state => ({ ...state, selectedSessionValue: selectedSessionValue }));
    }

    const setSelectedDataTypeValue = (selectedDataTypeValue: string) => {
        setUploaderContext(state => ({ ...state, selectedDataTypeValue: selectedDataTypeValue }));
    }

    const setIsSelectedProject = (isSelectedProject: boolean) => {
        setUploaderContext(state => ({ ...state, isSelectedProject: isSelectedProject }));
    }

    const setIsSelectedSubject = (isSelectedSubject: boolean) => {
        setUploaderContext(state => ({ ...state, isSelectedSubject: isSelectedSubject }));
    }

    const setIsSelectedSession = (isSelectedSession: boolean) => {
        setUploaderContext(state => ({ ...state, isSelectedSession: isSelectedSession }));
    }

    const setIsSelectedDataType = (isSelectedDataType: boolean) => {
        setUploaderContext(state => ({ ...state, isSelectedDataType: isSelectedDataType }));
    }

    const setIsSelectedDataTypeOther = (isSelectedDataTypeOther: boolean) => {
        setUploaderContext(state => ({ ...state, isSelectedDataTypeOther: isSelectedDataTypeOther }));
    }

    const setFileList = (fileList: RcFile[]) => {
        setUploaderContext(state => ({ ...state, fileList: fileList }))
    };

    const setHasFilesSelected = (hasFilesSelected: boolean) => {
        setUploaderContext(state => ({ ...state, hasFilesSelected: hasFilesSelected }));
    };

    const setFileListSummary = (fileListSummary: number) => {
        setUploaderContext(state => ({ ...state, fileListSummary: fileListSummary }));
    };

    const setProceed = (proceed: boolean) => {
        setUploaderContext(state => ({ ...state, proceed: proceed }));
    }

    useEffect(() => {
        const fetchData = async (username: string, password: string) => {
            setIsLoadingProjectList(true);
            const newProjectList = await fetchDummyProjectList(username, password);
            setProjectList(projectList => newProjectList);
            setIsLoadingProjectList(false);
            setUploaderContext(state => ({ ...state, projectList: projectList, isLoadingProjectList: isLoadingProjectList }))
        };
        fetchData(authContext!.username, authContext!.password);
    }, [authContext]);

    const [uploaderContext, setUploaderContext] = useState({
        projectList: projectList,
        isLoadingProjectList: isLoadingProjectList,
        selectedProjectStatus: "" as (typeof ValidateStatuses)[number],
        selectedSubjectStatus: "" as (typeof ValidateStatuses)[number],
        selectedSessionStatus: "" as (typeof ValidateStatuses)[number],
        selectedDataTypeStatus: "" as (typeof ValidateStatuses)[number],
        selectedDataTypeOtherStatus: "" as (typeof ValidateStatuses)[number],
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
        proceed: false,
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
        setFileListSummary: setFileListSummary,
        setProceed: setProceed
    });

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
