import React, { Dispatch, useContext, useEffect, useState } from "react";

import {
    Layout,
    Row,
    Col,
    Card,
    BackTop,
    message
} from "antd";

import LoadingIcon from "../../../../components/LoadingIcon/LoadingIcon";
import FileSelector from "../../components/FileSelector/FileSelector";
import FileList from "../../components/FileList/FileList";
import TargetPath from "../../components/TargetPath/TargetPath";
import StructureSelector from "../../components/StructureSelector/StructureSelector";
import UploadButton from "../../components/UploadButton/UploadButton";
import UploadModal from "../../components/UploadModal/UploadModal";
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal";
import ErrorModal from "../../../../components/ErrorModal/ErrorModal";

import {
    Project,
    RcFile,
    UploadState,
    UploadAction,
    ErrorState
} from "../../../../types/types";

import "../../../../app/App.less";
import { AuthContext } from "../../../../services/auth/auth";
import { baseURL, fetchRetry } from "../../../../services/fetch/fetch";

const { Content } = Layout;

interface UploaderProps {
    uploadState: UploadState;
    uploadDispatch: Dispatch<UploadAction>;
    errorState: ErrorState;
    handleRemoveSelectedFile: (uid: string, filename: string, size: number) => void;
    handleResetFileList: () => void;
    handleFilesSelection: (file: RcFile, batch: RcFile[]) => boolean | PromiseLike<void>;
    enableUploadButton: boolean;
    handleInitiateUpload: () => void;
    handleUploadAnotherBatch: () => void;
    showUploadModal: boolean;
    existingFiles: string[];
    showConfirmModal: boolean;
    handleCancelConfirmModal: () => void;
    handleOkConfirmModal: () => void;
    showErrorModal: boolean;
    handleOkErrorModal: () => void;
}

const Uploader: React.FC<UploaderProps> = ({
    uploadState,
    uploadDispatch,
    errorState,
    handleRemoveSelectedFile,
    handleResetFileList,
    handleFilesSelection,
    enableUploadButton,
    handleInitiateUpload,
    handleUploadAnotherBatch,
    showUploadModal,
    existingFiles,
    showConfirmModal,
    handleCancelConfirmModal,
    handleOkConfirmModal,
    showErrorModal,
    handleOkErrorModal
}) => {
    const filesSelection = uploadState.filesSelection;

    const [projects, setProjects] = useState([] as Project[]);
    const [isProjectsLoaded, setProjectsLoaded] = useState(false);

    const {profile} = useContext(AuthContext);

    useEffect(() => {
        // do nothing if profile is null
        if (! profile) return;

        // fetching projects from backend.
        const abortController = new AbortController();
        const signal = abortController.signal;
        fetchRetry({
            url: baseURL + "/projects",
            options: {
                method: 'GET',
                credentials: 'include',
                mode: 'cors',
                signal
            } as RequestInit,
            numRetries: 1, // 1 retry
            timeout: 10000 // 10 seconds
        }).then((result) => {
            if ( result.error ) throw new Error(result.error);
            setProjects(
                (result.data as Project[]).sort((a, b) => a.projectNumber.localeCompare(b.projectNumber))
            );
        }).catch((err: Error) => {
            message.error("fail to get projects: " + err.message);
        }).finally(() => {
            abortController.abort();
            setProjectsLoaded(true);
        });    

    }, [profile]);

    return (
        <>
        <div style={{ padding: "10px" }}>
            <Row>
                <Col span={12}>
                    <Card className="MainCard" style={{ marginRight: "5px" }}>
                        <FileSelector
                            handleFilesSelection={handleFilesSelection}
                        />
                        <br />
                        <br />
                        <FileList
                            filesSelection={filesSelection}
                            handleRemoveSelectedFile={handleRemoveSelectedFile}
                            handleResetFileList={handleResetFileList}
                        />
                        <div>
                            <BackTop />
                        </div>
                    </Card>
                </Col>
                <Col span={12}>
                    <Card className="MainCard" style={{ marginLeft: "5px" }}>
                        <h2>Set destination properties</h2>
                        <Content style={{ marginTop: "10px" }}>
                            <p style={{ fontWeight: "bold" }}>Destination(s)</p>
                            <TargetPath
                                uploadState={uploadState}
                            />
                        </Content>
                        <Content style={{ marginTop: "20px" }}>
                        {
                            isProjectsLoaded &&
                                <StructureSelector
                                    projectList={projects}
                                    uploadState={uploadState}
                                    uploadDispatch={uploadDispatch}/> ||
                                <>
                                <div>Loading projects for {profile?.displayName} ...</div>
                                <LoadingIcon />
                                </>
                        }
                        </Content>
                        <Content style={{ marginTop: "20px" }}>
                            <UploadButton
                                enable={enableUploadButton}
                                handleInitiateUpload={handleInitiateUpload}
                            />
                        </Content>
                    </Card>
                </Col>
            </Row>
        </div>
        <UploadModal
            uploadState={uploadState}
            errorState={errorState}
            showUploadModal={showUploadModal}
            handleUploadAnotherBatch={handleUploadAnotherBatch}/>
        <ConfirmModal
            uploadState={uploadState}
            showConfirmModal={showConfirmModal}
            handleOkConfirmModal={handleOkConfirmModal}
            handleCancelConfirmModal={handleCancelConfirmModal}
            existingFiles={existingFiles}/>
        <ErrorModal
            errorState={errorState}
            showErrorModal={showErrorModal}
            handleOkErrorModal={handleOkErrorModal}/>
        </>
    );
};

export default Uploader;
