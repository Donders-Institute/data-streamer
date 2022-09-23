import React, { useEffect, useState } from "react";

import { Spin, Tooltip, Typography } from "antd";

import { StagerResult, UploadState } from "../../../../types/types";
import { baseURL, fetchOnce } from "../../../../services/fetch/fetch";

const { Text } = Typography;

interface TargetPathProps {
    uploadState: UploadState;
}

const TargetPath: React.FC<TargetPathProps> = ({ uploadState }) => {

    const projectNumberInput = uploadState.structureSelection.projectNumberInput;
    const subjectLabelInput = uploadState.structureSelection.subjectLabelInput;
    const sessionLabelInput = uploadState.structureSelection.sessionLabelInput;
    const dataTypeInput = uploadState.structureSelection.dataTypeInput;
    const dataTypeOtherInput = uploadState.structureSelection.dataTypeOtherInput;

    const [projectNumber, setProjectNumber] = useState("");
    const [dacIdentifier, setDacIdentifier] = useState("");

    const [loading, setLoading] = useState(false);

    // call out to resolve the identifier of the associated DAC in the repository 
    useEffect(() => {

        if ( ! projectNumber ) {
            setDacIdentifier("");
            return;
        }

        const url = baseURL + "/stager/dac/" + projectNumber;
        const headers = new Headers(
            {
                'Content-Type': 'application/json',
            }
        );

        setLoading(true);
        fetchOnce(
            {
                url: url,
                options: {
                    headers: headers,
                },
                timeout: 30*1000,  // 30 second timeout
            }
        ).then((response) => {
            const collName = response.data && (response.data as StagerResult).collName;
            if (collName) {
                // converting collName to the webdav path: /nl.ru.donders/di/dccn/DAC_3055000.01_123 --> /dccn/DAC_3055000.01_123
                setDacIdentifier("/" + collName.split("/").slice(3).join("/"));
            } else {
                throw new Error(JSON.stringify(response));
            }
        }).catch((reason) => {
            // log error silently, and reset the DAC identifier
            console.warn("fail to get DAC for project ", projectNumber, " :", reason);
            setDacIdentifier("");
        }).finally(() => {
            setLoading(false);
        });
    }, [projectNumber]);

    let drivePath = (
        <span style={{ fontWeight: "bold", color: "#52c41a" }}>P:</span>
    );
    let backwardSlashPath = (
        <span style={{ fontWeight: "bold", color: "#52c41a" }}>\</span>
    );
    let forwardSlashPath = (
        <span style={{ fontWeight: "bold", color: "#52c41a" }}>/</span>
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
        const p = projectNumberInput.value;
        ( p !== projectNumber ) && setProjectNumber(p);
        projectNumberPath = (
            <span style={{ fontWeight: "bold", color: "#52c41a" }}>
                {p}
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
        <>
            <div>
                <Tooltip placement="bottomLeft" title="destination in the project storage">
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
            </div>
            <Spin
                tip="resolving destination in the Donders Repoitory"
                spinning={loading}
                style={{marginTop: "10px"}}>
                {
                    ( dacIdentifier === "" ) &&
                        <Tooltip placement="bottomLeft" title={"no data-acquisition collection for project " + projectNumber}>
                            <Text type="secondary">no available destination in the Donders Repository</Text>
                        </Tooltip> ||
                        <Tooltip placement="bottomLeft" title="destination in the Donders Repository">
                            <span style={{ fontWeight: "bold", color: "#52c41a" }}>{dacIdentifier}</span>
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
                }
            </Spin>
        </>
    );
};

export default TargetPath;
