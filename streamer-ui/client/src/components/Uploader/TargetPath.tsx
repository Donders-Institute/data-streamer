import React from "react";
import { Tooltip } from "antd";

interface TargetPathProps {
    isSelectedProject: boolean;
    projectNumber: string;
    subjectLabel: string;
    isSelectedDataType: boolean;
    dataType: string;
    sessionLabel: string;
}

const TargetPath: React.FC<TargetPathProps> = (
    {
        isSelectedProject,
        projectNumber,
        subjectLabel,
        isSelectedDataType,
        dataType,
        sessionLabel
    }) => {
    let forwardSlashPath = (
        <span style={{ fontWeight: "bold", color: "#52c41a" }}>/</span>
    );
    let projectPath = (
        <span style={{ fontWeight: "bold", color: "#52c41a" }}>project</span>
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
        <span style={{ fontStyle: "italic" }}>(projectnumber)</span>
    );
    let subjectLabelPath = (
        <span style={{ fontStyle: "italic" }}>(subjectlabel)</span>
    );
    let dataTypePath = <span style={{ fontStyle: "italic" }}>(datatype)</span>;
    let sessionLabelPath = (
        <span style={{ fontStyle: "italic" }}>(sessionlabel)</span>
    );

    if (isSelectedProject) {
        projectNumberPath = (
            <span style={{ fontWeight: "bold", color: "#52c41a" }}>
                {projectNumber}
            </span>
        );

        subjectLabelPath = (
            <span style={{ fontWeight: "bold", color: "#52c41a" }}>
                {subjectLabel}
            </span>
        );

        sessionLabelPath = (
            <span style={{ fontWeight: "bold", color: "#52c41a" }}>
                {sessionLabel}
            </span>
        );
    }

    if (isSelectedDataType) {
        dataTypePath = (
            <span style={{ fontWeight: "bold", color: "#52c41a" }}>{dataType}</span>
        );

        if (dataType === "other" || dataType === "") {
            dataTypePath = <span style={{ fontStyle: "italic" }}>(datatype)</span>;
        } else {
            dataTypePath = (
                <span style={{ fontWeight: "bold", color: "#52c41a" }}>
                    {dataType}
                </span>
            );
        }
    }

    return (
        <div>
            <Tooltip placement="bottomLeft" title="Destination folder">
                {forwardSlashPath}
                {projectPath}
                {forwardSlashPath}
                {projectNumberPath}
                {forwardSlashPath}
                {rawPath}
                {forwardSlashPath}
                {subjectPath}
                {subjectLabelPath}
                {forwardSlashPath}
                {sessionPath}
                {sessionLabelPath}
                {forwardSlashPath}
                {dataTypePath}
                {forwardSlashPath}
            </Tooltip>
        </div>
    );
};

export default TargetPath;
