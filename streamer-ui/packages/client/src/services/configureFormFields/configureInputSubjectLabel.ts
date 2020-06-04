import { Dispatch } from "react";
import { WrappedFormUtils } from "antd/lib/form/Form";

import {
    UploadState,
    UploadAction,
    UploadActionType,
    FormInputConfig,
    InputVariable,
    InputValidationStatuses,
    StructureSelection
} from "../../types/types";

import {
    isValidSubjectLabel,
    invalidSubjectLabelMessage
} from "../../services/inputValidation/inputValidation";

const configureInputSubjectLabel = ({ 
    inputStyle,
    labelStyle,
    helpStyle,
    uploadState, 
    uploadDispatch, 
    form
}: { 
    inputStyle: React.CSSProperties | undefined; 
    labelStyle: React.CSSProperties | undefined; 
    helpStyle: React.CSSProperties | undefined; 
    uploadState: UploadState; 
    uploadDispatch: Dispatch<UploadAction>; 
    form: WrappedFormUtils<any>;
}) => {
    // Validate user input
    const validator = (rule: any, value: string, callback: any) => {
        try {
            if (!isValidSubjectLabel(value)) {
                throw new Error(invalidSubjectLabelMessage);
            }
            callback();
        } catch (err) {
            callback(err);
        }
    };

    // Deal with change of subject label
    const handleChange = (value: string) => {
        let newSubjectLabelInput: InputVariable;

        const isValid = isValidSubjectLabel(value);
        if (isValid) {
            newSubjectLabelInput = {
                value,
                status: "success" as (typeof InputValidationStatuses)[number],
                isSelected: true
            } as InputVariable;
        } else {
            newSubjectLabelInput = {
                ...(uploadState.structureSelection.subjectLabelInput),
                status: "error" as (typeof InputValidationStatuses)[number],
                isSelected: false
            } as InputVariable;
        }

        return uploadDispatch({
            type: UploadActionType.Select,
            payload: {
                ...uploadState,
                structureSelection: {
                    ...uploadState.structureSelection,
                    subjectLabelInput: { ...newSubjectLabelInput }
                } as StructureSelection
            } as UploadState
        } as UploadAction);
    };

    // Grey out the selection box when a project has not yet been selected 
    const projectNumberInput = uploadState.structureSelection.projectNumberInput;
    const disable = !(projectNumberInput.isSelected);

    const subjectLabelInput = uploadState.structureSelection.subjectLabelInput;
    return {
        name: "subjectLabel",
        value: subjectLabelInput.value,
        validateStatus: subjectLabelInput.status,
        label: "Set subject label",
        help: invalidSubjectLabelMessage,
        message: "Please input your subject label",
        placeholder: "subjectlabel",
        validator,
        handleChange,
        disable,
        show: true, // Always show component
        labelStyle,
        helpStyle,
        inputStyle,
        form
    } as FormInputConfig;
};

export default configureInputSubjectLabel;
