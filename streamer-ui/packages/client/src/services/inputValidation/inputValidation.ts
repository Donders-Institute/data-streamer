import { useState, useEffect } from "react";

import {
    UploadStatus,
    UploadState,
} from "../../types/types";

// Validate files selection
const invalidFilesSelectionMessage = "No file(s) selected";

// Validate project number
export function isValidProjectNumber(value: string) {
    return value !== "";
};
export const invalidProjectNumberMessage = "No project selected";

// Allow as many lowercase and uppercase characters and numbers as needed.
const regexpSubjectLabel = new RegExp("^[a-zA-Z0-9]+$");
export function isValidSubjectLabel(value: string) {
    return regexpSubjectLabel.test(value);
};
export const invalidSubjectLabelMessage = "Should be combination of numbers and alphabets without special characters. Example: '009' or 'p02'";

// Allow as many lowercase and uppercase characters and numbers as needed.
const regexpSessionLabel = new RegExp("^[a-zA-Z0-9]+$");
export function isValidSessionLabel(value: string) {
    return regexpSessionLabel.test(value);
};
export const invalidSessionLabelMessage = "Should be combination of numbers and alphabets with no special characters. Examples: '1', 'mri02'";

// Validate data type
export function isValidDataType(value: string) {
    return value !== "";
};
export const invalidDataTypeMessage = "No data type selected";

// Start with lowercase characters.
// Next, allow as many lowercase characters, numbers, dashes, and underscores as needed.
const regexpDataTypeOther = new RegExp("^[a-z][-a-z0-9_]*$");
export function isValidDataTypeOther(dataTypeOther: string) {
    return regexpDataTypeOther.test(dataTypeOther);
};
export const invalidDataTypeOtherMessage = "Should be lower case string, starting with character and optionally with more lowercase characters numbers, dashes ('-'), and underscores ('_');'. Example: 'eyetracker' or 'audio-left'";

// Custom hook to validate user selected structure
export const useValidateSelection = (uploadState: UploadState) => {
    const [isValid, setIsValid] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null as Error | null);
 
    useEffect(() => {
        let mounted = true;

        const validate = async () => {
            if (uploadState.status === UploadStatus.Selecting) {

                console.log("Validating selection");

                const numFiles = uploadState.filesSelection.fileList.length;
                const hasFilesSelected = uploadState.filesSelection.hasFilesSelected;

                const projectNumberInput = uploadState.structureSelection.projectNumberInput;
                const subjectLabelInput = uploadState.structureSelection.subjectLabelInput;
                const sessionLabelInput = uploadState.structureSelection.sessionLabelInput;
                const dataTypeInput = uploadState.structureSelection.dataTypeInput;
                const dataTypeOtherInput = uploadState.structureSelection.dataTypeOtherInput;

                const isValidFilesSelection = numFiles && numFiles > 0 && hasFilesSelected;
                const isValidProjectSelection = projectNumberInput.status === "success" && isValidProjectNumber(projectNumberInput.value);
                const isValidSubjectLabelSelection = subjectLabelInput.status === "success" && isValidSubjectLabel(subjectLabelInput.value);
                const isValidSessionLabelSelection = sessionLabelInput.status === "success" && isValidSessionLabel(sessionLabelInput.value);
                const isValidDataTypeSelection = dataTypeInput.status === "success" && isValidDataType(dataTypeInput.value);

                let isValidDataTypeOtherSelection = true;
                if (isValidDataTypeSelection && dataTypeInput.value === "other") {
                    isValidDataTypeOtherSelection = dataTypeOtherInput.status === "success" && isValidDataTypeOther(dataTypeOtherInput.value);
                }

                if (mounted) {
                    setIsLoading(true);
                }

                try {
                    // Validate files selection
                    if (!isValidFilesSelection) {
                        throw new Error(invalidFilesSelectionMessage);
                    }
                    // Validate structure selection
                    if (!isValidProjectSelection) {
                        throw new Error(invalidProjectNumberMessage);
                    }
                    if (!isValidSubjectLabelSelection) {
                        throw new Error(invalidSubjectLabelMessage);
                    }
                    if (!isValidSessionLabelSelection) {
                        throw new Error(invalidSessionLabelMessage);
                    }
                    if (!isValidDataTypeSelection) {
                        throw new Error(invalidDataTypeMessage);
                    }
                    if (isValidDataTypeSelection && 
                        !isValidDataTypeOtherSelection) {
                        throw new Error(invalidDataTypeOtherMessage);
                    }
                    
                    if (mounted) {
                        setIsLoading(false);
                        setError(null);
                        setIsValid(true);

                        setError(null);
                    }
                } catch (err) {
                    if (mounted) {
                        setIsValid(false);
                        setError(err as Error | null);
                    }
                }
            }
        };
        validate();

        return function cleanup() {
            mounted = false;
        };
    }, [uploadState]);

    return [isValid, error, isLoading] as [boolean, Error | null, boolean];
};
