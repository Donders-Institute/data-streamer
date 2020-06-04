import { Dispatch } from "react";

import {
    UploadState,
    UploadAction,
    UploadActionType,
    FormSelectConfig,
    InputVariable,
    InputValidationStatuses,
    StructureSelection,
    initialInputVariable
} from "../../types/types";

import { isValidDataType } from "../../services/inputValidation/inputValidation";

// Possible data types to choose from
const dataTypes = [
    "mri",
    "meg",
    "eeg",
    "ieeg",
    "beh",
    "other"
];

const configureSelectDataType = ({ 
    selectStyle,
    labelStyle,
    helpStyle,
    uploadState, 
    uploadDispatch 
}: { 
    selectStyle: React.CSSProperties | undefined; 
    labelStyle: React.CSSProperties | undefined; 
    helpStyle: React.CSSProperties | undefined; 
    uploadState: UploadState; 
    uploadDispatch: Dispatch<UploadAction>; 
}) => {
    // Deal with data type selection
    const handleSelect = (value: string) => {
        let newDataTypeInput: InputVariable;

        const isValid = isValidDataType(value);
        if (isValid) {
            newDataTypeInput = {
                value,
                status: "success" as (typeof InputValidationStatuses)[number],
                isSelected: true
            } as InputVariable;
        } else {
            newDataTypeInput = {
                ...(uploadState.structureSelection.dataTypeInput),
                status: "error" as (typeof InputValidationStatuses)[number],
                isSelected: false
            } as InputVariable;
        }

        // Update dataType
        // Reset dataTypeOther
        return uploadDispatch({
            type: UploadActionType.Select,
            payload: {
                ...uploadState,
                structureSelection: {
                    ...uploadState.structureSelection,
                    dataTypeInput: { ...newDataTypeInput },
                    dataTypeOtherInput: { ...initialInputVariable },
                } as StructureSelection
            } as UploadState
        } as UploadAction);
    };

    // Grey out the selection box when a project has not yet been selected
    const projectNumberInput = uploadState.structureSelection.projectNumberInput;
    const disable = !(projectNumberInput.isSelected);

    const dataTypeInput = uploadState.structureSelection.dataTypeInput;
    return {
        options: dataTypes,
        option: dataTypeInput.value, // Currently selected data type
        optionNotSelected: "datatype",
        validateStatus: dataTypeInput.status,
        label: "Select data type",
        help: "Modality subfolder in which the data will be stored",
        handleSelect,
        disable,
        show: true, // Always show the data type selection component
        labelStyle,
        helpStyle,
        selectStyle
    } as FormSelectConfig;
};

export default configureSelectDataType;
