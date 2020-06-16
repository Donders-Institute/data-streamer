import React from "react";

import { Tooltip } from "antd";

import { UploadState } from "../../../../types/types";

interface TargetPathProps {
    uploadState: UploadState;
}

const TargetPath: React.FC<TargetPathProps> = ({ uploadState }) => {

    const projectNumberInput = uploadState.structureSelection.projectNumberInput;
    const subjectLabelInput = uploadState.structureSelection.subjectLabelInput;
    const sessionLabelInput = uploadState.structureSelection.sessionLabelInput;
    const dataTypeInput = uploadState.structureSelection.dataTypeInput;
    const dataTypeOtherInput = uploadState.structureSelection.dataTypeOtherInput;

    let drivePath = (
        <span style={{ fontWeight: "bold", color: "#52c41a" }}>P:</span>
    );
    let backwardSlashPath = (
        <span style={{ fontWeight: "bold", color: "#52c41a" }}>\</span>
    );
    let rawPath = (
        <span style={{ fontWeight: "bold", color: "#52c41a" }}>raw</span>
    );
    let subjectPath = (
        <span style={{ fontWeight: "bold", color: "#52c41a" }}>sub-</span>
    );
    let sessionPath = (
        <span style={{ fontWeight: "bold", color: "#52c41a" }}>ses-</span>
    );

    let projectNumberPath = (
        <span>(projectnumber)</span>
    );
    let subjectLabelPath = (
        <span>(subjectlabel)</span>
    );
    let dataTypePath = (
        <span>(datatype)</span>
    );
    let sessionLabelPath = (
        <span>(sessionlabel)</span>
    );

    if (projectNumberInput.isSelected) {
        projectNumberPath = (
            <span style={{ fontWeight: "bold", color: "#52c41a" }}>
                {projectNumberInput.value}
            </span>
        );
    }

    if (subjectLabelInput.isSelected) {
        subjectLabelPath = (
            <span style={{ fontWeight: "bold", color: "#52c41a" }}>
                {subjectLabelInput.value}
            </span>
        );
    }

    if (sessionLabelInput.isSelected) {
        sessionLabelPath = (
            <span style={{ fontWeight: "bold", color: "#52c41a" }}>
                {sessionLabelInput.value}
            </span>
        );
    }

    // Display the effective dataType value
    if (dataTypeInput.isSelected) {
        const dataType = dataTypeInput.value;

        dataTypePath = (
            <span style={{ fontWeight: "bold", color: "#52c41a" }}>{dataType}</span>
        );

        // Show dataTypeOther when "other" is selected
        if (dataType === "other" && dataTypeOtherInput.isSelected) {
            dataTypePath = (
                <span style={{ fontWeight: "bold", color: "#52c41a" }}>
                    {dataTypeOtherInput.value}
                </span>
            );
        }
    }

    return (
        <React.Fragment>
            <Tooltip placement="bottomLeft" title="Destination folder where files are uploaded to">
                {drivePath}
                {backwardSlashPath}
                {projectNumberPath}
                {backwardSlashPath}
                {rawPath}
                {backwardSlashPath}
                {subjectPath}
                {subjectLabelPath}
                {backwardSlashPath}
                {sessionPath}
                {sessionLabelPath}
                {backwardSlashPath}
                {dataTypePath}
                {backwardSlashPath}
            </Tooltip>
        </React.Fragment>
    );
};

export default TargetPath;
