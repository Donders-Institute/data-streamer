import React, { Dispatch } from "react";

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
    UserProfile,
    Project,
    RcFile,
    UploadState,
    UploadAction,
    ErrorState
} from "../../../../types/types";

import "../../../../app/App.less";

const { Content } = Layout;

interface UploaderProps {
    userProfile: UserProfile;
    handleSignOut: () => Promise<void>;
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
    userProfile,
    handleSignOut,
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

    return (
        <React.Fragment>
            <Content style={{ background: "#f0f2f5" }}>
                <Header userProfile={userProfile} handleSignOut={handleSignOut} />
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
                                        <Content style={{ marginTop: "20px" }}>
                                            <div>Loading projects for {userProfile.username} ...</div>
                                            <LoadingIcon />
                                        </Content>
                                    }
                                    {
                                        !isLoadingProjectList &&
                                        <Content style={{ marginTop: "20px" }}>
                                            <StructureSelector
                                                projectList={projectList}
                                                uploadState={uploadState}
                                                uploadDispatch={uploadDispatch}
                                            />
                                        </Content>
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
                    handleSignOut={handleSignOut}
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
