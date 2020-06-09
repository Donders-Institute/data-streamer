import React, { useReducer, useState, useEffect, Dispatch } from "react";
import { Switch, Route } from "react-router-dom";

import Login from "../scenes/Login/Login";
import Uploader from "../scenes/Uploader/scenes/Uploader/Uploader";
import Help from "../scenes/Help/Help";
import NotFound from "../scenes/NotFound/NotFound";

import {
    UserProfile,
    RcFile,
    FilesSelection,
    UploadStatus,
    UploadState,
    UploadActionType,
    UploadAction,
    initialUploadState,
    initialFilesSelection,
    ErrorState,
    ErrorAction,
    ErrorType,
    initialErrorState
} from "../types/types";

import { useFetchProjects } from "../services/pdb/pdb";

import {
    maxFileSizeLimitBytes,
    maxFileSizeLimitAsString,
    detectFile,
    fileNameExists,
    useInitiateUpload,
    useValidateUpload,
    useCheckApproval,
    useUpload,
    useFinalize,
    useSubmit
} from "../services/upload/upload";

import { useValidateSelection } from "../services/inputValidation/inputValidation";

import {
    resetError,
    useUpdateError
} from "../services/error/error";

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
        case UploadActionType.Finalize:
            return {
                ...(action.payload),
                status: UploadStatus.Finalizing
            };
        case UploadActionType.Submit:
            return {
                ...(action.payload),
                status: UploadStatus.Submitting
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

function errorReducer(state: ErrorState, action: ErrorAction) {
    if (action.type === ErrorType.NoError) {
        return initialErrorState;
    }
    return {
        errorType: action.type,
        errorMessage: action.payload.errorMessage
    };
};

interface AppLoggedInProps {
    userProfile: UserProfile;
    handleChangeUsername: (username: string) => Promise<void>;
    handleChangePassword: (password: string) => Promise<void>;
    handleSignIn: () => Promise<void>;
    handleSignOut: () => Promise<void>;
    mockPdb: boolean;
};

const AppLoggedIn: React.FC<AppLoggedInProps> = ({
    userProfile,
    handleChangeUsername,
    handleChangePassword,
    handleSignIn,
    handleSignOut,
    mockPdb
}) => {
    // Book keeping of upload state
    const [uploadState, uploadDispatch] = useReducer(uploadReducer, initialUploadState);

    // Book keeping of error state
    const [errorState, errorDispatch] = useReducer(errorReducer, initialErrorState);

    // List of available projects for user
    const [projectList, errorLoadingProjectList, isLoadingProjectList] = useFetchProjects(userProfile, mockPdb);

    useUpdateError({
        isLoading: isLoadingProjectList,
        error: errorLoadingProjectList,
        errorType: ErrorType.ErrorLoadingProjectList,
        errorDispatch,
        uploadState,
        uploadDispatch
    });

    // Book keeping of validation of selected files batch
    const [errorFilesSelect, setErrorFilesSelect] = useState(null as Error | null);
    const [isLoadingValidateFilesSelect, setIsLoadingValidateFilesSelect] = useState(false);

    useUpdateError({
        isLoading: isLoadingValidateFilesSelect,
        error: errorFilesSelect,
        errorType: ErrorType.ErrorSelect,
        errorDispatch,
        uploadState,
        uploadDispatch
    });

    // Validation of whole selection. If valid, make the upload button green
    const [isValidSelection, errorSelect, isLoadingValidateSelection] = useValidateSelection(uploadState);

    useEffect(() => {
        let mounted = true;

        const checkSelection = (isValid: boolean) => {
            if (uploadState.status === UploadStatus.Selecting) {
                if (mounted) {
                    uploadDispatch({
                        type: UploadActionType.Select,
                        payload: {
                            ...uploadState,
                            isValidSelection: isValid
                        } as UploadState
                    } as UploadAction);
                }
            }
        };
        checkSelection(isValidSelection);

        return function cleanup() {
            mounted = false;
        };
    }, [uploadState.status, isValidSelection]);

    useUpdateError({
        isLoading: isLoadingValidateSelection,
        error: errorSelect,
        errorType: ErrorType.ErrorSelect,
        errorDispatch,
        uploadState,
        uploadDispatch
    });

    // Show green upload button
    const enableUploadButton = isValidSelection;

    // Show upload modal
    const showUploadModal = uploadState.status !== UploadStatus.NotUploading && uploadState.status !== UploadStatus.Selecting;

    // Initiate upload
    const [errorInitiateUpload, isLoadingInitiateUpload] = useInitiateUpload({
        userProfile,
        uploadState,
        uploadDispatch
    });

    useUpdateError({
        isLoading: isLoadingInitiateUpload,
        error: errorInitiateUpload,
        errorType: ErrorType.ErrorInitiateUpload,
        errorDispatch,
        uploadState,
        uploadDispatch
    });

    // Validate upload
    const [hasExistingFiles, existingFiles, errorValidateUpload, isLoadingValidateUpload] = useValidateUpload({
        userProfile,
        uploadState,
        uploadDispatch
    });

    useUpdateError({
        isLoading: isLoadingValidateUpload,
        error: errorValidateUpload,
        errorType: ErrorType.ErrorValidateUpload,
        errorDispatch,
        uploadState,
        uploadDispatch
    });

    // Show upload modal
    const showConfirmModal = UploadStatus.Validating && hasExistingFiles;

    // Silently continue in case of no existing files
    useCheckApproval({
        uploadState,
        uploadDispatch,
        hasExistingFiles
    });

    // Handle approved upload
    const [percentage, numRemainingFiles, errorUpload, isLoadingUpload] = useUpload({
        userProfile,
        uploadState,
        uploadDispatch
    });

    useEffect(() => {
        let mounted = true;

        const updateProgress = (p: number, n: number) => {
            if (uploadState.status === UploadStatus.Uploading) {
                if (mounted) {
                    uploadDispatch({
                        type: UploadActionType.Upload,
                        payload: {
                            ...uploadState,
                            percentage: p,
                            numRemainingFiles: n
                        } as UploadState
                    } as UploadAction);
                }
            }
        };
        updateProgress(percentage, numRemainingFiles);

        return function cleanup() {
            mounted = false;
        };
    }, [uploadState.status, percentage, numRemainingFiles]);

    useUpdateError({
        isLoading: isLoadingUpload,
        error: errorUpload,
        errorType: ErrorType.ErrorUpload,
        errorDispatch,
        uploadState,
        uploadDispatch
    });

    // Handle finalize
    const [errorFinalize, isLoadingFinalize] = useFinalize({
        userProfile,
        uploadState,
        uploadDispatch
    });

    useUpdateError({
        isLoading: isLoadingFinalize,
        error: errorFinalize,
        errorType: ErrorType.ErrorFinalizeUpload,
        errorDispatch,
        uploadState,
        uploadDispatch
    });

    // Handle submit
    const [done, uploadedFiles, errorSubmit, isLoadingSubmit] = useSubmit({
        userProfile,
        uploadState,
        uploadDispatch
    });

    useUpdateError({
        isLoading: isLoadingSubmit,
        error: errorSubmit,
        errorType: ErrorType.ErrorSubmit,
        errorDispatch,
        uploadState,
        uploadDispatch
    });

    // Do not show error modal during selection and when no error.
    const showErrorModal = errorState.errorType !== ErrorType.ErrorSelect && errorState.errorType !== ErrorType.NoError;

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

    // Clear the file list. Set stage to select.
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
        setIsLoadingValidateFilesSelect(true);

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

        // Done
        setIsLoadingValidateFilesSelect(false);

        if (isValidBatch) {
            // Update files selection
            const newNumRemainingFiles = fileList.length + batch.length;
            return uploadDispatch({
                type: UploadActionType.Select,
                payload: {
                    ...uploadState,
                    percentage: 0,
                    numRemainingFiles: newNumRemainingFiles,
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

        // Set the error
        setErrorFilesSelect(new Error(errorMessage));

        // Keep the original files selection (i.e. without the batch).
        // Do not set uploadStatus to Error in select stage.
        return uploadDispatch({
            type: UploadActionType.Select,
            payload: {
                ...uploadState,
                percentage: 0,
                numRemainingFiles: fileList.length,
                filesSelection: {
                    fileList: [...fileList],
                    totalSizeBytes,
                    hasFilesSelected: fileList.length > 0
                } as FilesSelection
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
    const handleUploadAnotherBatch = async () => {
        // Reset the error state
        await resetError(errorDispatch);
        // Keep projectList, projectNumber, subject, session, dataType, etc.
        // but refresh the filelist.
        // Set stage to select.
        return handleResetFileList();
    };

    // Cancel upload in confirmation modal
    const handleCancelConfirmModal = async () => {
        // Reset the error state
        await resetError(errorDispatch);
        // Keep projectList, projectNumber, subject, session, dataType, etc.
        // but refresh the filelist.
        // Set stage to select.
        return handleResetFileList();
    };

    // Handle Ok button in confirmation modal
    const handleOkConfirmModal = () => {
        // Proceed. Set stage to actual upload.
        return uploadDispatch({
            type: UploadActionType.Upload,
            payload: { ...uploadState } as UploadState
        } as UploadAction);
    };

    // Handle Ok button in error modal
    const handleOkErrorModal = () => {
        // Reset the error state
        return resetError(errorDispatch);
    };

    return (
        <Switch>
            <Route
                path="/login"
                exact={true}
                render={() => {
                    return <Login
                        handleChangeUsername={handleChangeUsername}
                        handleChangePassword={handleChangePassword}
                        handleSignIn={handleSignIn}
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
                            handleSignOut={handleSignOut}
                            projectList={projectList}
                            isLoadingProjectList={isLoadingProjectList}
                            uploadState={uploadState}
                            uploadDispatch={uploadDispatch}
                            errorState={errorState}
                            handleRemoveSelectedFile={handleRemoveSelectedFile}
                            handleResetFileList={handleResetFileList}
                            handleFilesSelection={handleFilesSelection}
                            enableUploadButton={enableUploadButton}
                            handleInitiateUpload={handleInitiateUpload}
                            handleUploadAnotherBatch={handleUploadAnotherBatch}
                            showUploadModal={showUploadModal}
                            existingFiles={existingFiles}
                            showConfirmModal={showConfirmModal}
                            handleCancelConfirmModal={handleCancelConfirmModal}
                            handleOkConfirmModal={handleOkConfirmModal}
                            showErrorModal={showErrorModal}
                            handleOkErrorModal={handleOkErrorModal}
                        />;
                    }
                    return <Login
                        handleChangeUsername={handleChangeUsername}
                        handleChangePassword={handleChangePassword}
                        handleSignIn={handleSignIn}
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
                            handleSignOut={handleSignOut}
                        />;
                    }
                    return <Login
                        handleChangeUsername={handleChangeUsername}
                        handleChangePassword={handleChangePassword}
                        handleSignIn={handleSignIn}
                    />;
                }}
            />
            <Route
                render={() => {
                    if (userProfile.isAuthenticated) {
                        return <NotFound
                            userProfile={userProfile}
                            handleSignOut={handleSignOut}
                        />;
                    }
                    return <Login
                        handleChangeUsername={handleChangeUsername}
                        handleChangePassword={handleChangePassword}
                        handleSignIn={handleSignIn}
                    />;
                }}
            />
        </Switch>
    );
};

export default AppLoggedIn;
