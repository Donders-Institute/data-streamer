import React, { Dispatch, useContext } from "react";

import {
    Layout,
    Row,
    Col,
    Card,
    BackTop
} from "antd";

import Header from "../../../../components/Header/Header";
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
    ErrorState,
    AuthActionType
} from "../../../../types/types";

import "../../../../app/App.less";
import { AuthContext } from "../../../../services/auth/authContext";

const { Content } = Layout;

interface UploaderProps {
    projectList: Project[];
    isLoadingProjectList: boolean;
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
    projectList,
    isLoadingProjectList,
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

    const {state: authState} = useContext(AuthContext);

    return (
        <React.Fragment>
            <Content style={{ background: "#f0f2f5" }}>
                <Header/>
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
                                    isLoadingProjectList &&
                                        <>
                                        <div>Loading projects for {authState.userProfile.username} ...</div>
                                        <LoadingIcon />
                                        </> ||
                                        <StructureSelector
                                            projectList={projectList}
                                            uploadState={uploadState}
                                            uploadDispatch={uploadDispatch}/>
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
                    handleUploadAnotherBatch={handleUploadAnotherBatch}
                />
                <ConfirmModal
                    uploadState={uploadState}
                    showConfirmModal={showConfirmModal}
                    handleOkConfirmModal={handleOkConfirmModal}
                    handleCancelConfirmModal={handleCancelConfirmModal}
                    existingFiles={existingFiles}
                />
                <ErrorModal
                    errorState={errorState}
                    showErrorModal={showErrorModal}
                    handleOkErrorModal={handleOkErrorModal}
                />
            </Content>
        </React.Fragment >
    );
};

export default Uploader;
