import { useEffect, useState, Dispatch } from "react";

import {
    ErrorType,
    ErrorState, 
    ErrorAction,
    initialErrorState,
    UploadStatus
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

// Custom hook to update error state and upload state
export const useUpdateError = ({
    error,
    errorType,
    errorDispatch,
    uploadStatus
} : {
    error: Error | null;
    errorType: ErrorType;
    errorDispatch: Dispatch<ErrorAction>;
    uploadStatus: UploadStatus;
}) => {
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        let mounted = true;

        // Check for error
        const check = async (error: Error | null) => {

            if (mounted) {
                setBusy(true);
            }

            if (error) {
                // Skip selection errors
                if (uploadStatus !== UploadStatus.Selecting) {
                    if (mounted) {
                         // Update the error state
                        await updateError({
                            error,
                            errorType,
                            errorDispatch
                        });
                    }
                }
            } 

            if (mounted) {
                setBusy(false);
            }
        };
        check(error);

        return function cleanup() {
            mounted = false;
        };
    }, [uploadStatus, error, errorType]);

    return busy;
};
