import React, { useReducer, useState, useEffect } from "react";
import { Switch, Route } from "react-router-dom";

import Login from "../scenes/Login/Login";
import Uploader from "../scenes/Uploader/scenes/Uploader/Uploader";
import Help from "../scenes/Help/Help";
import NotFound from "../scenes/NotFound/NotFound";

import {
    UserProfile,
    ServerResponse,
    RcFile,
    FilesSelection,
    UploadStatus,
    UploadState,
    UploadActionType,
    UploadAction,
    initialUploadState,
    initialFilesSelection
} from "../types/types";

import { useFetchProjects } from "../services/pdb/pdb";

import {
    maxFileSizeLimitBytes,
    maxFileSizeLimitAsString,
    detectFile,
    fileNameExists,
    useInitiateUpload,
    useValidateUpload,
    useUpload
} from "../services/upload/upload";

import { useValidateSelection } from "../services/inputValidation/inputValidation";

import {
    useCheckErrorSignOut,
    useCheckErrorLoadingProjectList,
    useCheckErrorUpload
} from "../services/checkError/checkError";

import "./App.less";

function uploadReducer(state: UploadState, action: UploadAction) {
    switch (action.type) {
        case UploadActionType.Reset:
            return initialUploadState;
        case UploadActionType.Select:
            return {
                ...(action.payload),
                status: UploadStatus.Selecting
            };
        case UploadActionType.Initiate:
            return {
                ...(action.payload),
                status: UploadStatus.Initiating
            };
        case UploadActionType.Validate:
            return {
                ...(action.payload),
                status: UploadStatus.Validating
            };
        case UploadActionType.Confirm:
            return {
                ...(action.payload),
                status: UploadStatus.Confirming
            };
        case UploadActionType.Upload:
            return {
                ...(action.payload),
                status: UploadStatus.Uploading
            };
        case UploadActionType.Finish:
            return {
                ...(action.payload),
                status: UploadStatus.Success
            };
        case UploadActionType.Error:
            return {
                ...(action.payload),
                status: UploadStatus.Error
            };
    }
};

interface AppLoggedInProps {
    userProfile: UserProfile;
    signIn: (username: string, password: string) => Promise<ServerResponse>;
    signOut: (username: string, password: string) => Promise<ServerResponse>;
    mockPdb: boolean;
};

const AppLoggedIn: React.FC<AppLoggedInProps> = ({
    userProfile,
    signIn,
    signOut,
    mockPdb
}) => {
    // Sign out error
    const [errorSignOut, setErrorSignOut] = useState(null as Error | null);

    // List of available projects for user
    const [projectList, errorLoadingProjectList, isLoadingProjectList] = useFetchProjects(userProfile, mockPdb);

    // Book keeping of upload state
    const [uploadState, uploadDispatch] = useReducer(uploadReducer, initialUploadState);

    // Validation of selection. If hasValidSelection is true, make the upload button green
    const [hasValidSelection, errorSelection] = useValidateSelection(uploadState);

    // Show upload modal
    const showUploadModal = uploadState.status !== UploadStatus.NotUploading && uploadState.status !== UploadStatus.Selecting;

    // Initiate upload
    const [errorInitiateUpload, isLoadingInitiateUpload] = useInitiateUpload(userProfile, uploadState, uploadDispatch);

    // Validate upload
    const [hasExistingFiles, existingFiles, errorValidateUpload, isLoadingValidateUpload] = useValidateUpload(userProfile, uploadState, uploadDispatch);

    // Handle approved upload
    const [uploadedFiles, errorUpload, isLoadingUpload] = useUpload(userProfile, uploadState, uploadDispatch);

    // Check for error
    const hasErrorLoadingProjectList = useCheckErrorLoadingProjectList({
        errorLoadingProjectList,
        uploadState,
        uploadDispatch
    });

    const hasErrorSignOut = useCheckErrorSignOut({
        errorSignOut,
        uploadState,
        uploadDispatch
    });

    const hasErrorUpload = useCheckErrorUpload({
        errorInitiateUpload,
        errorValidateUpload,
        errorUpload,
        uploadState,
        uploadDispatch
    });

    // Show error modal when needed
    const [showErrorModal, setShowErrorModal] = useState(false);

    useEffect(() => {
        const show = async (
            hasErrorLoadingProjectList: boolean,
            hasSignOutError: boolean,
            hasUploadError: boolean
        ) => {
            if (hasErrorLoadingProjectList || hasSignOutError || hasUploadError) {
                return setShowErrorModal(true);
            }
            return setShowErrorModal(false);
        };
        show(hasErrorLoadingProjectList, hasErrorSignOut, hasErrorUpload);
    }, [hasErrorLoadingProjectList, hasErrorSignOut, hasErrorUpload]);

    // Handle sign out in header and upload modal
    const handleSignOut = async () => {
        const username = userProfile.username;
        const password = userProfile.password;

        let result: ServerResponse;
        try {
            result = await signOut(username, password);

            // Double check result for error
            if (result.error) {
                throw new Error(result.error);
            }

            // Success, reset all
            return uploadDispatch({
                type: UploadActionType.Reset,
                payload: { ...initialUploadState }
            } as UploadAction);

        } catch (err) {
            return setErrorSignOut(err);
        }
    };

    // Remove a selected file from the list
    const handleRemoveSelectedFile = (filename: string, uid: string, size: number) => {
        const fileList = uploadState.filesSelection.fileList;
        const totalSizeBytes = uploadState.filesSelection.totalSizeBytes;

        const newFileList = fileList.filter(
            (file: RcFile) => file.name !== filename && file.uid !== uid
        );
        const newTotalSizeBytes = totalSizeBytes - size;
        const newHasFilesSelected = newFileList.length > 0;

        return uploadDispatch({
            type: UploadActionType.Select,
            payload: {
                ...uploadState,
                filesSelection: {
                    fileList: [...newFileList],
                    totalSizeBytes: newTotalSizeBytes,
                    hasFilesSelected: newHasFilesSelected
                } as FilesSelection
            } as UploadState
        } as UploadAction);
    };

    // Clear the file list
    const handleResetFileList = () => {
        return uploadDispatch({
            type: UploadActionType.Select,
            payload: {
                ...uploadState,
                filesSelection: { ...initialFilesSelection }
            } as UploadState
        } as UploadAction);
    };

    // Helper function for file selector
    const handleFilesSelection = async (file: RcFile, batch: RcFile[]) => {
        const fileList = uploadState.filesSelection.fileList;
        const totalSizeBytes = uploadState.filesSelection.totalSizeBytes;

        let batchSizeBytes = 0;
        let isValidBatch = true;
        let maxFileSizeExceeded = false;

        let directories = [] as string[];
        let largeFiles = [] as string[];
        let duplicates = [] as string[];

        for (const batchFile of batch) {
            const batchFileFilename = batchFile.name;
            const batchFileFileSizeBytes = batchFile.size;

            batchSizeBytes += batchFileFileSizeBytes;

            // Make sure that the file is not a directory
            const isFile = await detectFile(batchFile);
            if (!isFile) {
                directories.push(batchFileFilename);
                isValidBatch = false;
            }

            // Check if file is not too big
            if (batchFileFileSizeBytes >= maxFileSizeLimitBytes) {
                largeFiles.push(batchFileFilename);
                maxFileSizeExceeded = true;
                isValidBatch = false;
            }

            // Check if a file with the same filename exists already
            if (fileNameExists(batchFile, fileList)) {
                duplicates.push(batchFileFilename);
                isValidBatch = false;
            }
        }

        if (isValidBatch) {
            // Success
            return uploadDispatch({
                type: UploadActionType.Select,
                payload: {
                    ...uploadState,
                    filesSelection: {
                        fileList: [...fileList, ...batch],
                        totalSizeBytes: totalSizeBytes + batchSizeBytes,
                        hasFilesSelected: true
                    } as FilesSelection
                } as UploadState
            } as UploadAction);
        }

        // Invalid batch. Refine error
        let errorMessage = "Invalid batch: Unexpected error";

        if (directories.length > 0) {
            if (directories.length === 1) {
                errorMessage = `Selected item is a directory, please select files only: "${directories[0]}"`;
            } else {
                errorMessage = `Selected items are directories, please select files only: [${directories.join(", ")}]`;
            }
        }

        if (directories.length === 0 && duplicates.length > 0) {
            if (duplicates.length === 1) {
                errorMessage = `Filename already exists: "${duplicates[0]}"`;
            } else {
                errorMessage = `Filenames already exist: [${duplicates.join(", ")}]`;
            }
        }

        if (directories.length === 0 && duplicates.length === 0 && maxFileSizeExceeded) {
            if (largeFiles.length === 1) {
                errorMessage = `Maximum file size exceeded (file size must be less than ${maxFileSizeLimitAsString} for a single file): "${largeFiles[0]}"`;
            } else {
                errorMessage = `Maximum file size exceeded (file size must be less than ${maxFileSizeLimitAsString} for a single file): [${largeFiles.join(", ")}]`;
            }
        }

        return uploadDispatch({
            type: UploadActionType.Select,
            payload: {
                ...uploadState,
                filesSelection: {
                    fileList: [...fileList],
                    totalSizeBytes,
                    hasFilesSelected: fileList.length > 0
                } as FilesSelection,
                error: new Error(errorMessage)
            } as UploadState
        } as UploadAction);
    };

    // Kickstart a new upload
    const handleInitiateUpload = () => {
        return uploadDispatch({
            type: UploadActionType.Initiate,
            payload: { ...uploadState } as UploadState
        } as UploadAction);
    };

    // Start from scratch
    const handleUploadAnotherBatch = () => {
        // Keep projectList, projectNumber, subject, session, dataType, etc.
        // but refresh the filelist
        return handleResetFileList();
    };

    // Cancel upload
    const handleCancelFilesExistModal = () => {
        // Keep projectList, projectNumber, subject, session, dataType, etc.
        // but refresh the filelist
        return handleResetFileList();
    };

    // No user confirmation needed, proceed
    const handleOkFilesExistModal = () => {
        return uploadDispatch({
            type: UploadActionType.Upload,
            payload: { ...uploadState } as UploadState
        } as UploadAction);
    };

    // Handle Ok button in error modal
    const handleOkErrorModal = () => {
        return setShowErrorModal(false);
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
                            uploadState={uploadState}
                            uploadDispatch={uploadDispatch}
                            handleRemoveSelectedFile={handleRemoveSelectedFile}
                            handleResetFileList={handleResetFileList}
                            handleFilesSelection={handleFilesSelection}
                            enableUploadButton={hasValidSelection}
                            handleInitiateUpload={handleInitiateUpload}
                            handleUploadAnotherBatch={handleUploadAnotherBatch}
                            showUploadModal={showUploadModal}
                            existingFiles={existingFiles}
                            showFilesExistModal={hasExistingFiles}
                            handleCancelFilesExistModal={handleCancelFilesExistModal}
                            handleOkFilesExistModal={handleOkFilesExistModal}
                            showErrorModal={showErrorModal}
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
