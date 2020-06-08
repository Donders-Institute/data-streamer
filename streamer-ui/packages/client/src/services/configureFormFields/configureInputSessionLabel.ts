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
    isValidSessionLabel,
    invalidSessionLabelMessage
} from "../../services/inputValidation/inputValidation";

const configureInputSessionLabel = ({ 
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
            if (!isValidSessionLabel(value)) {
                throw new Error(invalidSessionLabelMessage);
            }
            callback();
        } catch (err) {
            callback(err);
        }
    };

    // Deal with change of session label
    const handleChange = (value: string) => {
        let newSessionLabelInput: InputVariable;

        const isValid = isValidSessionLabel(value);
        if (isValid) {
            newSessionLabelInput = {
                value,
                status: "success" as (typeof InputValidationStatuses)[number],
                isSelected: true
            } as InputVariable;
        } else {
            newSessionLabelInput = {
                ...(uploadState.structureSelection.sessionLabelInput),
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
                    sessionLabelInput: { ...newSessionLabelInput }
                } as StructureSelection
            } as UploadState
        } as UploadAction);
    };

    // Grey out the selection box when a project has not yet been selected 
    const projectNumberInput = uploadState.structureSelection.projectNumberInput;
    const disable = !(projectNumberInput.isSelected);

    const sessionLabelInput = uploadState.structureSelection.sessionLabelInput;
    return {
        name: "sessionLabel",
        value: sessionLabelInput.value,
        validateStatus: sessionLabelInput.status,
        label: "Set session label",
        help: invalidSessionLabelMessage,
        message: "Please input your session label",
        placeholder: "sessionlabel",
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

export default configureInputSessionLabel;
