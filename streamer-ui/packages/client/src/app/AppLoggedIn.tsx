import React, { useState, useEffect } from "react";
import { Switch, Route } from "react-router-dom";

import Login from "../scenes/Login/Login";
import Uploader from "../scenes/Uploader/scenes/Uploader/Uploader";
import Help from "../scenes/Help/Help";
import NotFound from "../scenes/NotFound/NotFound";

import ExistingFilesList from "../scenes/Uploader/components/ExistingFilesList/ExistingFilesList";

import {
    UserProfile,
    ServerResponse,
    Project,
    RcFile,
    InputValidationStatuses,
    AddFileResult,
    ValidationResult,
    SubmitResult
} from "../types/types";

import {
    fetchProjectList,
    fetchDummyProjectList
} from "../services/pdb/pdb";

import {
    maxSizeLimitBytes,
    maxSizeLimitAsString,
    detectFile,
    fileNameExists,
    initiate,
    validate,
    addFile,
    finalize,
    submit
} from "../services/upload/upload";

import {
    validateSubjectLabelInput,
    validateSessionLabelInput,
    validateSelectedDataTypeOtherInput
} from "../services/inputValidation/inputValidation";

import "./App.less";

interface AppLoggedInProps {
    userProfile: UserProfile;
    signIn: (username: string, password: string) => Promise<ServerResponse>;
    signOut: (username: string, password: string) => Promise<ServerResponse>;
    mockPdb: boolean;
}

const AppLoggedIn: React.FC<AppLoggedInProps> = ({
    userProfile,
    signIn,
    signOut,
    mockPdb
}) => {

    // List of available projects for user
    const [projectList, setProjectList] = useState([] as Project[]);
    const [isLoadingProjectList, setIsLoadingProjectList] = useState(true);

    // User selected file list
    const [fileList, setFileList] = useState([] as RcFile[]);
    const [fileListSummary, setFileListSummary] = useState(0);
    const [hasFilesSelected, setHasFilesSelected] = useState(false);

    // User selected project
    const [selectedProjectValue, setSelectedProjectValue] = useState("");
    const [selectedProjectStatus, setSelectedProjectStatus] = useState("" as (typeof InputValidationStatuses)[number]);
    const [isSelectedProject, setIsSelectedProject] = useState(false);

    // User selected subject
    const [selectedSubjectValue, setSelectedSubjectValue] = useState("");
    const [selectedSubjectStatus, setSelectedSubjectStatus] = useState("" as (typeof InputValidationStatuses)[number]);
    const [isSelectedSubject, setIsSelectedSubject] = useState(false);

    // User selected session
    const [selectedSessionValue, setSelectedSessionValue] = useState("");
    const [selectedSessionStatus, setSelectedSessionStatus] = useState("" as (typeof InputValidationStatuses)[number]);
    const [isSelectedSession, setIsSelectedSession] = useState(false);

    // User selected data type
    const [selectedDataTypeValue, setSelectedDataTypeValue] = useState("");
    const [selectedDataTypeStatus, setSelectedDataTypeStatus] = useState("" as (typeof InputValidationStatuses)[number]);
    const [isSelectedDataType, setIsSelectedDataType] = useState(false);
    const [selectedDataTypeOtherStatus, setSelectedDataTypeOtherStatus] = useState("" as (typeof InputValidationStatuses)[number]);
    const [isSelectedDataTypeOther, setIsSelectedDataTypeOther] = useState(false);

    const [proceed, setProceed] = useState(false);

    // Current upload session
    const [uploadSessionId, setUploadSessionId] = useState(-1);
    const [totalSizeBytes, setTotalSizeBytes] = useState(0);

    const [showUploadModal, setShowUploadModal] = useState(false);
    const [isUploading, setIsUploading] = useState(true);
    const [uploadingPercentage, setUploadingPercentage] = useState(0);
    const [remainingItems, setRemainingItems] = useState(0);
    const [failed, setFailed] = useState(false);

    const [showFilesExistModal, setShowFilesExistModal] = useState(false);
    const [existingFilesList, setExistingFilesList] = useState(<React.Fragment />);

    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        if (mockPdb) {
            const fetchDummyProjects = async (username: string) => {
                let newProjectList = [] as Project[];
                try {
                    newProjectList = await fetchDummyProjectList(username);
                } catch (err) {
                    console.error(err);
                    const newErrorMessage = JSON.stringify(err);
                    setErrorMessage(newErrorMessage);
                    setShowErrorModal(true);
                } finally {
                    newProjectList.forEach((project: Project) => {
                        console.log(project.projectNumber);
                    });
                    setProjectList(projectList => newProjectList);
                    setIsLoadingProjectList(false);
                }
            };
            fetchDummyProjects(userProfile.username);
        } else {
            const fetchProjects = async (username: string, password: string) => {
                if (projectList.length < 1) {
                    // Only fetch the data when the project list is yet empty
                    console.log(`Fetching projects for ${username} ...`);

                    setIsLoadingProjectList(true);

                    let newProjectList = [] as Project[];
                    try {
                        newProjectList = await fetchProjectList(username, password);
                    } catch (err) {
                        console.error(err);
                        const newErrorMessage = JSON.stringify(err);
                        setErrorMessage(newErrorMessage);
                        setShowErrorModal(true);
                    } finally {
                        newProjectList.forEach((project: Project) => {
                            console.log(project.projectNumber);
                        });
                        setProjectList(projectList => newProjectList);
                        setIsLoadingProjectList(false);
                    }
                }
            };
            fetchProjects(userProfile.username, userProfile.password);
        }
    }, [userProfile]);

    useEffect(() => {
        const checkProceed = async () => {
            if (!hasFilesSelected) {
                setProceed(false);
                return; // Abort
            }
            if (selectedProjectStatus !== "success") {
                setProceed(false);
                return; // Abort
            }
            if (selectedSubjectStatus !== "success") {
                setProceed(false);
                return; // Abort
            }
            if (selectedSessionStatus !== "success") {
                setProceed(false);
                return; // Abort
            }
            if (selectedDataTypeStatus !== "success") {
                setProceed(false);
                return; // Abort
            }
            let dataTypeOk = false;
            if (isSelectedDataTypeOther) {
                dataTypeOk = (selectedDataTypeStatus === "success" &&
                    selectedDataTypeOtherStatus === "success" &&
                    selectedDataTypeValue !== "") ? true : false;
            }
            else {
                dataTypeOk = (selectedDataTypeStatus === "success") ? true : false;
            }
            if (!dataTypeOk) {
                setProceed(false);
                return; // Abort
            }

            setProceed(true);
        };
        checkProceed();
    }, [
        hasFilesSelected,
        selectedProjectValue,
        selectedProjectStatus,
        isSelectedProject,
        selectedSubjectValue,
        selectedSubjectStatus,
        isSelectedSubject,
        selectedSessionValue,
        selectedSessionStatus,
        isSelectedSession,
        selectedDataTypeValue,
        selectedDataTypeStatus,
        isSelectedDataType,
        selectedDataTypeOtherStatus,
        isSelectedDataTypeOther
    ]);

    const handleSignOut = async () => {
        const username = userProfile.username;
        const password = userProfile.password;

        let result: ServerResponse;
        try {
            result = await signOut(username, password);
        } catch (err) {
            console.error('Sign out failure');
            console.error(err);
            const newErrorMessage = JSON.stringify(err);
            setErrorMessage(newErrorMessage);
            setShowErrorModal(true);
            setIsUploading(false);
            setFailed(true);
            return; // Abort
        }

        // Double check result for errors
        if (result.error) {
            console.error('Sign out failure');
            const newErrorMessage = result.error as string;
            console.error(newErrorMessage);
            setErrorMessage(newErrorMessage);
            setShowErrorModal(true);
            setIsUploading(false);
            setFailed(true);
            return; // Abort
        }

        setIsUploading(false);
        setFailed(false);
        console.log('Successfully signed out');
    };

    function changeFileList(newFileList: RcFile[], newFileListSummary: number, newHasFilesSelected: boolean) {
        setFileList(fileList => newFileList);
        setFileListSummary(newFileListSummary);
        setHasFilesSelected(newHasFilesSelected);
    };

    // Remove a file from the file list presented in the UI
    const handleDelete = (uid: string, filename: string, size: number) => {
        const newFileList = fileList.filter(
            (item: RcFile) => item.name !== filename && item.uid !== uid
        );
        const newHasFilesSelected = newFileList.length > 0;
        const newFileListSummary = fileListSummary - size;
        changeFileList(newFileList, newFileListSummary, newHasFilesSelected);
    };

    // Remove the whole file list presented in the UI
    const handleDeleteList = () => {
        changeFileList([] as RcFile[], 0, false);
    };

    // Helper function for file selector
    const handleBeforeUpload = async (file: RcFile, batch: RcFile[]) => {
        let batchSizeBytes = 0;
        let isValidBatch = true;
        let maxFileSizeExceeded = false;
        let directories = [] as string[];
        let largeFiles = [] as string[];
        let duplicates = [] as string[];

        // TODO: Find a way to do this check only once (i.e. per batch)
        for (let i = 0; i < batch.length; i++) {
            batchSizeBytes += file.size;

            // Make sure that the file is not a directory
            const isFile = await detectFile(file);
            if (!isFile) {
                directories.push(batch[i].name);
                isValidBatch = false;
            }

            // Check if file is not too big
            if (file.size >= maxSizeLimitBytes) {
                largeFiles.push(batch[i].name);
                maxFileSizeExceeded = true;
                isValidBatch = false;
            }

            // Check if a file with the same filename exists already
            if (fileNameExists(batch[i], fileList)) {
                duplicates.push(batch[i].name);
                isValidBatch = false;
            }
        }

        if (isValidBatch) {
            const newFileList = [...fileList, ...batch];
            const newFileListSummary = fileListSummary + batchSizeBytes;
            const newHasFilesSelected = true;
            changeFileList(newFileList, newFileListSummary, newHasFilesSelected);
        } else {
            const newFileList = [...fileList];
            const newFileListSummary = fileListSummary;
            const newHasFilesSelected = fileList.length > 0;
            changeFileList(newFileList, newFileListSummary, newHasFilesSelected);

            let msg = "";

            if (directories.length > 0) {
                if (directories.length === 1) {
                    msg = `Selected item is a directory, please select files only: "${directories[0]}"`;
                } else {
                    msg = `Selected items are directories, please select files only: [${directories.join(", ")}]`;
                }
                setErrorMessage(msg);
                setShowErrorModal(true);
            }

            if (directories.length === 0 && duplicates.length > 0) {
                if (duplicates.length === 1) {
                    msg = `Filename already exists: "${duplicates[0]}"`;
                } else {
                    msg = `Filenames already exist: [${duplicates.join(", ")}]`;
                }
                setErrorMessage(msg);
                setShowErrorModal(true);
            }

            if (directories.length === 0 && duplicates.length === 0 && maxFileSizeExceeded) {
                if (largeFiles.length === 1) {
                    msg = `Maximum file size exceeded (file size must be less than ${maxSizeLimitAsString} for a single file): "${largeFiles[0]}"`;
                } else {
                    msg = `Maximum file size exceeded (file size must be less than ${maxSizeLimitAsString} for a single file): [${largeFiles.join(", ")}]`;
                }
                setErrorMessage(msg);
                setShowErrorModal(true);
            }
        }
    };

    function changeProject(
        newValue: string,
        newSelectedStatus: (typeof InputValidationStatuses)[number],
        newIsSelected: boolean
    ) {
        setSelectedProjectValue(newValue);
        setSelectedProjectStatus(newSelectedStatus);
        setIsSelectedProject(newIsSelected);
    };

    function changeSubject(
        newValue: string,
        newSelectedStatus: (typeof InputValidationStatuses)[number],
        newIsSelected: boolean
    ) {
        setSelectedSubjectValue(newValue);
        setSelectedSubjectStatus(newSelectedStatus);
        setIsSelectedSubject(newIsSelected);
    };

    function changeSession(
        newValue: string,
        newSelectedStatus: (typeof InputValidationStatuses)[number],
        newIsSelected: boolean
    ) {
        setSelectedSessionValue(newValue);
        setSelectedSessionStatus(newSelectedStatus);
        setIsSelectedSession(newIsSelected);
    };

    function changeDataType(
        newSelectedDataTypeValue: string,
        newSelectedDataTypeStatus: (typeof InputValidationStatuses)[number],
        newIsSelectedDataType: boolean,
        newSelectedDataTypeOtherStatus: (typeof InputValidationStatuses)[number],
        newIsSelectedDataTypeOther: boolean
    ) {
        setSelectedDataTypeValue(newSelectedDataTypeValue);
        setSelectedDataTypeStatus(newSelectedDataTypeStatus);
        setIsSelectedDataType(newIsSelectedDataType);
        setSelectedDataTypeOtherStatus(newSelectedDataTypeOtherStatus);
        setIsSelectedDataTypeOther(newIsSelectedDataTypeOther);
    };

    // Deal with project selection (drop down menu)
    const handleSelectProject = (projectNumber: string) => {
        changeProject(projectNumber, "success", true);

        // Reset the other fields
        changeSubject("", "", false);
        changeSession("", "", false);
        changeDataType("", "", false, "", false);
    };

    // Deal with subject label (free text input)
    const handleChangeSubjectLabel = (subjectLabel: string) => {
        changeSubject(subjectLabel, "validating", true);

        const isValid = validateSubjectLabelInput(subjectLabel);
        if (isValid) {
            changeSubject(subjectLabel, "success", true);
            return; // Success
        }

        // Deal with empty string and other errors
        let value = subjectLabel;
        if (value !== "") {
            value = selectedSubjectValue;
        }
        changeSubject(value, "error", false);
    };

    // Deal with session label (free text input)
    const handleChangeSessionLabel = (sessionLabel: string) => {
        changeSession(sessionLabel, "validating", true);

        const isValid = validateSessionLabelInput(sessionLabel);
        if (isValid) {
            changeSession(sessionLabel, "success", true);
            return; // Success
        }

        // Deal with empty string and other errors
        let value = sessionLabel;
        if (value !== "") {
            value = selectedSessionValue;
        }
        changeSession(value, "error", false);
    };

    // Deal with data type selection (drop down menu) and data type other (free text input)
    const handleSelectDataType = (dataType: string) => {
        if (dataType === "other") {
            handleChangeDataTypeOther(dataType);
            return; // Done
        }
        changeDataType(dataType, "success", true, "", false);
    };

    // Deal with data type other (free text input)
    const handleChangeDataTypeOther = (dataTypeOther: string) => {
        changeDataType(dataTypeOther, "success", true, "validating", true);

        const isValid = validateSelectedDataTypeOtherInput(dataTypeOther);
        if (isValid) {
            changeDataType(dataTypeOther, "success", true, "success", true);
            return; // Success
        }

        // Deal with empty string and other errors
        let value = dataTypeOther;
        if (value !== "") {
            value = selectedDataTypeValue;
        }
        changeDataType(value, "success", true, "error", false);
    };

    const handleAddFile = async (file: RcFile) => {
        console.log(`Upload session: ${uploadSessionId}; upload file: ${file.name}`);

        let addFileResult: AddFileResult;
        try {
            addFileResult = await addFile(
                userProfile.username,
                userProfile.password,
                uploadSessionId,
                selectedProjectValue,
                selectedSubjectValue,
                selectedSessionValue,
                selectedDataTypeValue,
                file);
        } catch (err) {
            throw err;
        }

        // Derive percentage done and remaining files
        let newUploadingPercentage = 100;
        if (totalSizeBytes > 0) {
            const fileSizeBytes = file.size;
            uploadingPercentage + Math.floor(100.0 * fileSizeBytes / totalSizeBytes)
        }
        setUploadingPercentage(newUploadingPercentage);
        setRemainingItems(remainingItems => remainingItems - 1);

        return addFileResult;
    };

    // Handle the actual upload (i.e. with user approval if needed).
    // 1. Upload all files to the streamer buffer.
    // 2. Finalize the upload session. 
    // 3. Submit a streamer job to take care of the transfer of files in the background 
    //    (i.e. to the project storage folder and the Donders Repository)
    const handleApprovedUpload = async (uploadSessionId: number) => {

        console.log("Prepare the uploading to the streamer buffer");
        let uploadWork = [] as Promise<AddFileResult>[];

        fileList.forEach((file: RcFile) => {
            uploadWork.push(handleAddFile(file));
        });

        console.log("Upload all files to the streamer buffer");
        try {
            await Promise.all(uploadWork);
        } catch (err) {
            throw err;
        } finally {
            setRemainingItems(0);
            setUploadingPercentage(100);
        }

        console.log("Finalize the upload session");
        try {
            await finalize(
                userProfile.username,
                userProfile.password,
                uploadSessionId,
                selectedProjectValue,
                selectedSubjectValue,
                selectedSessionValue,
                selectedDataTypeValue
            );
        } catch (err) {
            throw err;
        }

        console.log("Submit a streamer job");
        let submitResult: SubmitResult;
        try {
            submitResult = await submit(
                userProfile.username,
                userProfile.password,
                uploadSessionId,
                selectedProjectValue,
                selectedSubjectValue,
                selectedSessionValue,
                selectedDataTypeValue
            );
        } catch (err) {
            throw err;
        }

        console.log("Successfully submitted streamer job for files: " + JSON.stringify(submitResult.fileNames));

        setIsUploading(false);
        setFailed(false);
    };

    // Handle the upload request. 
    // 1. Initiate the upload
    // 2. Validate the files to be uploaded
    // 3. Check if user confirmation is needed to overwite an existing project storage folder and files
    // 4. If all green, proceed with the actual upload
    const handleUpload = async () => {
        setShowFilesExistModal(false);
        setFailed(false);
        setRemainingItems(fileList.length);
        setUploadingPercentage(0);
        setIsUploading(true);
        setShowUploadModal(true);

        // Initiate the upload
        let newUploadSessionId = -1;
        let newTotalSizeBytes = 0;
        try {
            [newUploadSessionId, newTotalSizeBytes] = await initiate(
                userProfile.username,
                userProfile.password,
                selectedProjectValue,
                selectedSubjectValue,
                selectedSessionValue,
                selectedDataTypeValue,
                fileList) as [number, number];
        } catch (err) {
            console.error(err);
            const newErrorMessage = JSON.stringify(err);
            setErrorMessage(newErrorMessage);
            setShowErrorModal(true);
            setIsUploading(false);
            setFailed(true);
            return; // Abort
        }

        // Update state
        setUploadSessionId(newUploadSessionId);
        setTotalSizeBytes(newTotalSizeBytes);

        // Validate the files to be uploaded, one by one
        let validationResult: ValidationResult;
        try {
            validationResult = await validate(
                userProfile.username,
                userProfile.password,
                newUploadSessionId,
                selectedProjectValue,
                selectedSubjectValue,
                selectedSessionValue,
                selectedDataTypeValue,
                fileList);
        } catch (err) {
            console.error(err);
            const newErrorMessage = JSON.stringify(err);
            setErrorMessage(newErrorMessage);
            setShowErrorModal(true);
            setIsUploading(false);
            setFailed(true);
            return; // Abort
        }

        console.log(`Upload session: ${newUploadSessionId}`);
        console.dir(validationResult);
        console.log(validationResult.existingFiles);
        console.log(validationResult.existingFiles.length);
        console.log(validationResult.existingFiles.length > 0);
        console.log(Array.isArray(validationResult.existingFiles));

        const existingFiles = validationResult.existingFiles;
        console.log(existingFiles);
        console.log(existingFiles.length);
        console.log(existingFiles.length > 0);
        console.log(Array.isArray(existingFiles));

        // Before continuing the actual upload, 
        // check if user confirmation is needed 
        // to overwite an existing project storage folder and files (if any)
        if (Array.isArray(validationResult.existingFiles) && validationResult.existingFiles.length > 0) {
            const newExistingFilesList = <ExistingFilesList
                existingFiles={validationResult.existingFiles}
            />;
            setExistingFilesList(existingFilesList => newExistingFilesList);
            setShowFilesExistModal(true);
            return; // Abort
        }

        // No user confirmation is needed. Proceed.
        handleApprovedUpload(newUploadSessionId)
            .catch((err) => {
                console.error(err);
                const newErrorMessage = JSON.stringify(err);
                setErrorMessage(newErrorMessage);
                setShowErrorModal(true);
                setIsUploading(false);
                setFailed(true);
            });
    };

    const handleUploadAnotherBatch = () => {
        setShowUploadModal(false);
        // Keep projectList, projectNumber, subject, session, dataType, etc.
        // but refresh the filelist
        handleDeleteList();
    };

    // Cancel upload
    const handleCancelFilesExistModal = () => {
        setShowFilesExistModal(false);
        setExistingFilesList(<React.Fragment />);
        setShowUploadModal(false);

        // Keep projectList, projectNumber, subject, session, dataType, etc.
        // but refresh the filelist
        handleDeleteList();
    };

    // Ask user if destination folder and file(s) already exist
    const handleOkFilesExistModal = () => {
        setShowFilesExistModal(false);
        setExistingFilesList(<React.Fragment />);

        // No user confirmation needed, proceed
        console.log(`Upload session: ${uploadSessionId}`);
        handleApprovedUpload(uploadSessionId)
            .catch((err) => {
                console.error(err);
                const newErrorMessage = JSON.stringify(err);
                setErrorMessage(newErrorMessage);
                setShowErrorModal(true);
                setIsUploading(false);
                setFailed(true);
            });
    };

    // Handle Ok button in error modal
    const handleOkErrorModal = () => {
        setFailed(true);
        setShowErrorModal(false);
        setErrorMessage("");
    };

    return (
        <Switch>
            <Route
                path="/login"
                exact={true}
                render={() => {
                    return <Login
                        userProfile={userProfile}
                        signIn={signIn}
                    />;
                }}
            />
            <Route
                path="/"
                exact={true}
                render={() => {
                    if (userProfile.isAuthenticated) {
                        return <Uploader
                            userProfile={userProfile}
                            signOut={signOut}
                            handleSignOut={handleSignOut}
                            projectList={projectList}
                            isLoadingProjectList={isLoadingProjectList}
                            fileList={fileList}
                            fileListSummary={fileListSummary}
                            hasFilesSelected={hasFilesSelected}
                            handleDelete={handleDelete}
                            handleDeleteList={handleDeleteList}
                            handleBeforeUpload={handleBeforeUpload}
                            selectedProjectValue={selectedProjectValue}
                            selectedProjectStatus={selectedProjectStatus}
                            isSelectedProject={isSelectedProject}
                            selectedSubjectValue={selectedSubjectValue}
                            selectedSubjectStatus={selectedSubjectStatus}
                            isSelectedSubject={isSelectedSubject}
                            selectedSessionValue={selectedSessionValue}
                            selectedSessionStatus={selectedSessionStatus}
                            isSelectedSession={isSelectedSession}
                            selectedDataTypeValue={selectedDataTypeValue}
                            selectedDataTypeStatus={selectedDataTypeStatus}
                            isSelectedDataType={isSelectedDataType}
                            selectedDataTypeOtherStatus={selectedDataTypeOtherStatus}
                            isSelectedDataTypeOther={isSelectedDataTypeOther}
                            handleSelectProject={handleSelectProject}
                            handleChangeSubjectLabel={handleChangeSubjectLabel}
                            handleChangeSessionLabel={handleChangeSessionLabel}
                            handleSelectDataType={handleSelectDataType}
                            handleChangeDataTypeOther={handleChangeDataTypeOther}
                            proceed={proceed}
                            handleUpload={handleUpload}
                            handleUploadAnotherBatch={handleUploadAnotherBatch}
                            showUploadModal={showUploadModal}
                            isUploading={isUploading}
                            uploadingPercentage={uploadingPercentage}
                            remainingItems={remainingItems}
                            failed={failed}
                            showFilesExistModal={showFilesExistModal}
                            existingFilesList={existingFilesList}
                            handleCancelFilesExistModal={handleCancelFilesExistModal}
                            handleOkFilesExistModal={handleOkFilesExistModal}
                            showErrorModal={showErrorModal}
                            errorMessage={errorMessage}
                            handleOkErrorModal={handleOkErrorModal}
                        />;
                    }
                    return <Login
                        userProfile={userProfile}
                        signIn={signIn}
                    />;
                }}
            />
            <Route
                path="/help"
                exact={true}
                render={() => {
                    if (userProfile.isAuthenticated) {
                        return <Help
                            userProfile={userProfile}
                            signOut={signOut}
                        />;
                    }
                    return <Login
                        userProfile={userProfile}
                        signIn={signIn}
                    />;
                }}
            />
            <Route
                render={() => {
                    if (userProfile.isAuthenticated) {
                        return <NotFound
                            userProfile={userProfile}
                            signOut={signOut}
                        />;
                    }
                    return <Login
                        userProfile={userProfile}
                        signIn={signIn}
                    />;
                }}
            />
        </Switch>
    );
};

export default AppLoggedIn;
