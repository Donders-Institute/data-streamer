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
    isValidDataTypeOther,
    invalidDataTypeOtherMessage
} from "../../services/inputValidation/inputValidation";

const configureInputDataTypeOther = ({ 
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
            if (!isValidDataTypeOther(value)) {
                throw new Error(invalidDataTypeOtherMessage);
            }
            callback();
        } catch (err) {
            callback(err);
        }
    };

    // Deal with change of data type other
    const handleChange = (value: string) => {
        let newDataTypeOtherInput: InputVariable;

        const isValid = isValidDataTypeOther(value);
        if (isValid) {
            newDataTypeOtherInput = {
                value,
                status: "success" as (typeof InputValidationStatuses)[number],
                isSelected: true
            } as InputVariable;
        } else {
            newDataTypeOtherInput = {
                ...(uploadState.structureSelection.dataTypeOtherInput),
                status: "error" as (typeof InputValidationStatuses)[number],
                isSelected: false
            } as InputVariable;
        }

        // Update dataTypeOther only (and thus keep dataType as it is)
        return uploadDispatch({
            type: UploadActionType.Select,
            payload: {
                ...uploadState,
                structureSelection: {
                    ...uploadState.structureSelection,
                    dataTypeOtherInput: { ...newDataTypeOtherInput }
                } as StructureSelection
            } as UploadState
        } as UploadAction);
    };

    // Grey out the selection box when \
    // 1) a project has not yet been selected, 
    // 2) data type has not yet been selected 
    const projectNumberInput = uploadState.structureSelection.projectNumberInput;
    const dataTypeInput = uploadState.structureSelection.dataTypeInput;
    const disable = !(projectNumberInput.isSelected) || !(dataTypeInput.isSelected);

    // Only show the component when dataType = dataTypeOther has been selected.
    const show = dataTypeInput.isSelected && dataTypeInput.status !== "error" && dataTypeInput.value === "other";

    const dataTypeOtherInput = uploadState.structureSelection.dataTypeOtherInput;
    return {
        name: "dataTypeOther",
        value: dataTypeOtherInput.value,
        validateStatus: dataTypeOtherInput.status,
        label: "Set data type other",
        help: invalidDataTypeOtherMessage,
        message: "Please input your other data type",
        placeholder: "datatype",
        validator,
        handleChange,
        disable,
        show,
        labelStyle,
        helpStyle,
        inputStyle,
        form
    } as FormInputConfig;
};

export default configureInputDataTypeOther;
