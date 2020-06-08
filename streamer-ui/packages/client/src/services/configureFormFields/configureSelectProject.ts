import { Dispatch } from "react";

import {
    UploadState,
    UploadAction,
    UploadActionType,
    Project,
    StructureSelection,
    FormSelectConfig,
    InputVariable,
    InputValidationStatuses
} from "../../types/types";

import { isValidProjectNumber } from "../../services/inputValidation/inputValidation";

const configureSelectProject = ({ 
    projectList, 
    selectStyle,
    labelStyle,
    helpStyle,
    uploadState, 
    uploadDispatch 
}: { 
    projectList: Project[];
    selectStyle: React.CSSProperties | undefined; 
    labelStyle: React.CSSProperties | undefined; 
    helpStyle: React.CSSProperties | undefined; 
    uploadState: UploadState; 
    uploadDispatch: Dispatch<UploadAction>; 
}) => {
    // Selectable projects
    const options = projectList.map(project => project.projectNumber);

    // Deal with project selection
    const handleSelect = (value: string) => {
        let newProjectNumberInput: InputVariable;

        const isValid = isValidProjectNumber(value);
        if (isValid) {
            newProjectNumberInput = {
                value,
                status: "success" as (typeof InputValidationStatuses)[number],
                isSelected: true
            } as InputVariable;
        } else {
            newProjectNumberInput = {
                ...(uploadState.structureSelection.projectNumberInput),
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
                    projectNumberInput: { ...newProjectNumberInput }
                } as StructureSelection
            } as UploadState
        } as UploadAction);
    };

    const projectNumberInput = uploadState.structureSelection.projectNumberInput;
    return {
        options,
        option: projectNumberInput.value, // Currently selected project
        optionNotSelected: "projectnumber",
        validateStatus: projectNumberInput.status,
        label: "Select project",
        help: "Projects for which you are entitled to upload data to",
        handleSelect,
        disable: false, // Never grey out the selection box
        show: true, // Always show the project selection component
        selectStyle,
        labelStyle,
        helpStyle
    } as FormSelectConfig;
};

export default configureSelectProject;