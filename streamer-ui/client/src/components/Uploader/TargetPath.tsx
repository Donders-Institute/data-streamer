import React from "react";

interface IProps {
    isSelectedProject: boolean;
    projectNumber: string;
    isSelectedSubject: boolean;
    subjectLabel: string;
    isSelectedSession: boolean;
    isSelectedDataType: boolean;
    dataType: string;
    sessionLabel: string;
}

const TargetPath: React.FC<IProps> = (
    {
        isSelectedProject,
        projectNumber,
        isSelectedSubject,
        subjectLabel,
        isSelectedSession,
        isSelectedDataType,
        dataType,
        sessionLabel
    }) => {
    let forwardSlashPath = (
        <span style={{ fontWeight: "bold", color: "#f45709" }}>/</span>
    );
    let projectPath = (
        <span style={{ fontWeight: "bold", color: "#f45709" }}>project</span>
    );
    let rawPath = (
        <span style={{ fontWeight: "bold", color: "#f45709" }}>raw</span>
    );
    let subjectPath = (
        <span style={{ fontWeight: "bold", color: "#f45709" }}>sub-</span>
    );
    let sessionPath = (
        <span style={{ fontWeight: "bold", color: "#f45709" }}>ses-</span>
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
            <span style={{ fontWeight: "bold", color: "#f45709" }}>
                {projectNumber}
            </span>
        );
    }
    if (isSelectedSubject) {
        subjectLabelPath = (
            <span style={{ fontWeight: "bold", color: "#f45709" }}>
                {subjectLabel}
            </span>
        );
    }
    if (isSelectedDataType && dataType !== "other") {
        dataTypePath = (
            <span style={{ fontWeight: "bold", color: "#f45709" }}>{dataType}</span>
        );
    }
    if (isSelectedDataType) {
        if (dataType === "other" || dataType === "") {
            dataTypePath = <span style={{ fontStyle: "italic" }}>(datatype)</span>;
        } else {
            dataTypePath = (
                <span style={{ fontWeight: "bold", color: "#f45709" }}>
                    {dataType}
                </span>
            );
        }
    }
    if (isSelectedSession) {
        sessionLabelPath = (
            <span style={{ fontWeight: "bold", color: "#f45709" }}>
                {sessionLabel}
            </span>
        );
    }

    return (
        <div>
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
        </div>
    );
};

export default TargetPath;
