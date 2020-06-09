import { useState, useEffect, Dispatch } from "react";

import {
    ErrorType,
    ErrorState, 
    ErrorAction,
    initialErrorState,
    UploadState,
    UploadAction,
    UploadActionType,
    UploadStatus,
    AuthState,
    AuthAction,
    AuthActionType
} from "../../types/types";

// Set error state to no error
export const resetError = async (errorDispatch: Dispatch<ErrorAction>) => {
    return errorDispatch({
        type: initialErrorState.errorType,
        payload: { ...initialErrorState}
    } as ErrorAction);
};

// Update error state
const updateError = async ({
    error, 
    errorType, 
    errorDispatch
} : {
    error: Error | null, 
    errorType: ErrorType, 
    errorDispatch: Dispatch<ErrorAction>
}) => {
    if (error) {
        // Update the error state with the caught error message
        try {
            return errorDispatch({
                type: errorType,
                payload: {
                    errorType,
                    errorMessage: error.message
                } as ErrorState
            } as ErrorAction);
        } catch (err) {
            return errorDispatch({
                type: ErrorType.ErrorUnknown,
                payload: {
                    errorType: ErrorType.ErrorUnknown,
                    errorMessage: err.message
                } as ErrorState
            } as ErrorAction);
        }
    }

    // Otherwise reset the error to no error
    return resetError(errorDispatch);
};

// Custom hook to update error state and auth state
export const useUpdateAuthError = ({
    isLoading,
    error,
    errorType,
    errorDispatch,
    authState,
    authDispatch
} : {
    isLoading: boolean;
    error: Error | null;
    errorType: ErrorType;
    errorDispatch: Dispatch<ErrorAction>;
    authState: AuthState;
    authDispatch: Dispatch<AuthAction>;
}) => {
    useEffect(() => {
        let mounted = true;

        // Check for error
        const check = async (error: Error | null) => {
            if (error) {
                // Update the error state
                await updateError({
                    error,
                    errorType,
                    errorDispatch
                });

                if (mounted) {
                    // Update the auth state
                    authDispatch({
                        type: AuthActionType.Error,
                        payload: { ...authState }
                    });
                }
            }
        };
        check(error);

        return function cleanup() {
            mounted = false;
        };
    }, [authState.status, isLoading, error, errorType]);
};


// Custom hook to update error state and upload state
export const useUpdateError = ({
    isLoading,
    error,
    errorType,
    errorDispatch,
    uploadState,
    uploadDispatch
} : {
    isLoading: boolean;
    error: Error | null;
    errorType: ErrorType;
    errorDispatch: Dispatch<ErrorAction>;
    uploadState: UploadState;
    uploadDispatch: Dispatch<UploadAction>;
}) => {
    useEffect(() => {
        let mounted = true;

        // Check for error
        const check = async (error: Error | null) => {
            if (error) {
                // Update the error state
                await updateError({
                    error,
                    errorType,
                    errorDispatch
                });

                // Update the upload state
                // Skip selection errors
                if (uploadState.status !== UploadStatus.Selecting) {
                    if (mounted) {
                        uploadDispatch({
                            type: UploadActionType.Error,
                            payload: { ...uploadState }
                        });
                    }
                }
            }
        };
        check(error);

        return function cleanup() {
            mounted = false;
        };
    }, [uploadState.status, isLoading, error, errorType]);
};
