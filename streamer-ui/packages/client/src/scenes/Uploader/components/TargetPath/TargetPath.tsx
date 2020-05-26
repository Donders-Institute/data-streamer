import React from "react";

import { Tooltip } from "antd";

interface TargetPathProps {
    isSelectedProject: boolean;
    isSelectedSubject: boolean;
    isSelectedSession: boolean;
    isSelectedDataType: boolean;
    projectNumber: string;
    subjectLabel: string;
    dataType: string;
    sessionLabel: string;
}

const TargetPath: React.FC<TargetPathProps> = (
    {
        isSelectedProject,
        isSelectedSubject,
        isSelectedSession,
        isSelectedDataType,
        projectNumber,
        subjectLabel,
        dataType,
        sessionLabel
    }) => {
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
    let dataTypePath = <span >(datatype)</span>;
    let sessionLabelPath = (
        <span>(sessionlabel)</span>
    );

    if (isSelectedProject) {
        projectNumberPath = (
            <span style={{ fontWeight: "bold", color: "#52c41a" }}>
                {projectNumber}
            </span>
        );
    }

    if (isSelectedSubject) {
        subjectLabelPath = (
            <span style={{ fontWeight: "bold", color: "#52c41a" }}>
                {subjectLabel}
            </span>
        );
    }

    if (isSelectedSession) {
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
            dataTypePath = <span>(datatype)</span>;
        } else {
            dataTypePath = (
                <span style={{ fontWeight: "bold", color: "#52c41a" }}>
                    {dataType}
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
