import { useState, useEffect, Dispatch } from "react";

import {
    UploadStatus,
    UploadState,
    UploadAction,
    UploadActionType
} from "../../types/types";

// Custom hook to check for signout error
export const useCheckErrorSignOut = ({ 
    errorSignOut, 
    uploadState, 
    uploadDispatch 
}: { 
    errorSignOut: Error | null; 
    uploadState: UploadState; 
    uploadDispatch: Dispatch<UploadAction>; 
}) => {

    const [hasSignOutError, setHasSignOutError] = useState(false);

    useEffect(() => {
        const checkError = async () => {
            if (errorSignOut) {
                setHasSignOutError(true);
                return uploadDispatch({
                        type: UploadActionType.Error,
                        payload: { 
                        ...uploadState,
                        error: errorSignOut
                        } as UploadState 
                    } as UploadAction);
            }
        };
        checkError();
    }, []);

    return hasSignOutError;
};

// Custom hook to check for loading project list error
export const useCheckErrorLoadingProjectList = ({ 
    errorLoadingProjectList, 
    uploadState, 
    uploadDispatch 
}: { 
    errorLoadingProjectList: Error | null; 
    uploadState: UploadState; 
    uploadDispatch: Dispatch<UploadAction>; 
}) => {

    const [hasSignOutError, setHasSignOutError] = useState(false);

    useEffect(() => {
        const checkError = async () => {
            if (errorLoadingProjectList) {
                setHasSignOutError(true);
                return uploadDispatch({
                        type: UploadActionType.Error,
                        payload: { 
                        ...uploadState,
                        error: errorLoadingProjectList
                        } as UploadState 
                    } as UploadAction);
            }
        };
        checkError();
    }, []);

    return hasSignOutError;
};

// Custom hook to check for upload error
export const useCheckErrorUpload = ({ 
    errorInitiateUpload, 
    errorValidateUpload, 
    errorUpload, 
    uploadState, 
    uploadDispatch 
}: { 
    errorInitiateUpload: Error | null; 
    errorValidateUpload: Error | null; 
    errorUpload: Error | null; 
    uploadState: UploadState; 
    uploadDispatch: Dispatch<UploadAction>; 
}) => {

    const uploadStatus = uploadState.status;
    const [hasUploadError, setHasUploadError] = useState(false);

    useEffect(() => {
        const checkError = async () => {
            if (uploadStatus !== UploadStatus.NotUploading) {
                let error = null as Error | null;
        
                if (errorInitiateUpload) error = errorInitiateUpload;
                if (errorValidateUpload) error = errorValidateUpload;
                if (errorUpload) error = errorUpload;

                setHasUploadError(true);

                return uploadDispatch({
                        type: UploadActionType.Error,
                        payload: { 
                        ...uploadState,
                        error
                        } as UploadState 
                    } as UploadAction);
            }
        };
        checkError();
    }, []);

    return hasUploadError;
};