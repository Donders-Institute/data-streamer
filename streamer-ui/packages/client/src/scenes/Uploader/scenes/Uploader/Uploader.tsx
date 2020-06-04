import React, { Dispatch } from "react";

import {
    Layout,
    Row,
    Col,
    Card,
    Icon,
    Button,
    BackTop,
    Modal,
    Progress
} from "antd";

import Header from "../../../../components/Header/Header";
import LoadingIcon from "../../../../components/LoadingIcon/LoadingIcon";
import FileSelector from "../../components/FileSelector/FileSelector";
import FileList from "../../components/FileList/FileList";
import TargetPath from "../../components/TargetPath/TargetPath";
import StructureSelector from "../../components/StructureSelector/StructureSelector";
import ExistingFilesList from "../../components/ExistingFilesList/ExistingFilesList";
import UploadButton from "../../components/UploadButton/UploadButton";

import {
    UserProfile,
    Project,
    RcFile,
    ServerResponse,
    UploadState,
    UploadAction,
    UploadStatus
} from "../../../../types/types";

import "../../../../app/App.less";

const { Content } = Layout;

interface UploaderProps {
    userProfile: UserProfile;
    signOut: (username: string, password: string) => Promise<ServerResponse>;
    handleSignOut: (username: string, password: string) => Promise<void>;
    projectList: Project[];
    isLoadingProjectList: boolean;
    uploadState: UploadState;
    uploadDispatch: Dispatch<UploadAction>;
    handleRemoveSelectedFile: (uid: string, filename: string, size: number) => void;
    handleResetFileList: () => void;
    handleFilesSelection: (file: RcFile, batch: RcFile[]) => boolean | PromiseLike<void>;
    enableUploadButton: boolean;
    handleInitiateUpload: () => void;
    handleUploadAnotherBatch: () => void;
    showUploadModal: boolean;
    existingFiles: string[];
    showFilesExistModal: boolean;
    handleCancelFilesExistModal: () => void;
    handleOkFilesExistModal: () => void;
    showErrorModal: boolean;
    handleOkErrorModal: () => void;
}

const Uploader: React.FC<UploaderProps> = ({
    userProfile,
    signOut,
    handleSignOut,
    projectList,
    isLoadingProjectList,
    uploadState,
    uploadDispatch,
    handleRemoveSelectedFile,
    handleResetFileList,
    handleFilesSelection,
    enableUploadButton,
    handleInitiateUpload,
    handleUploadAnotherBatch,
    showUploadModal,
    existingFiles,
    showFilesExistModal,
    handleCancelFilesExistModal,
    handleOkFilesExistModal,
    showErrorModal,
    handleOkErrorModal
}) => {
    const filesSelection = uploadState.filesSelection;

    const isUploading = uploadState.status === UploadStatus.Uploading;
    const remainingFiles = uploadState.remainingFiles;
    const percentage = uploadState.percentage;

    const hasUploadError = uploadState.status === UploadStatus.Error;
    const uploadError = uploadState.error;
    let uploadErrorMessage = "Upload error";
    if (uploadError) {
        if (uploadError.message) {
            uploadErrorMessage = uploadError.message;
        }
    }

    return (
        <React.Fragment>
            <Content style={{ background: "#f0f2f5" }}>
                <Header userProfile={userProfile} signOut={signOut} />
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
                                    <p style={{ fontWeight: "bold" }}>Destination folder</p>
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
                <Modal
                    title="Uploading"
                    visible={showUploadModal}
                    closable={false}
                    footer={[
                        <div key="buttons" style={{ height: "auto" }}>
                            <Row>
                                <Col span={24} style={{ textAlign: "right" }}>
                                    <Button
                                        type="primary"
                                        disabled={isUploading}
                                        onClick={() => { handleUploadAnotherBatch(); }}
                                    >
                                        Upload another batch
                                    </Button>
                                    <Button
                                        disabled={isUploading}
                                        onClick={() => {
                                            handleSignOut(userProfile.username, userProfile.password);
                                        }}
                                    >
                                        <Icon type="logout" /> Sign out
                                    </Button>
                                </Col>
                            </Row>
                        </div>
                    ]}
                    width={"80%"}
                    style={{
                        left: "0px",
                        top: "50px",
                        height: "100%",
                        overflowY: "initial"
                    }}
                    bodyStyle={{
                        height: "80vh",
                        overflowY: "auto",
                        backgroundColor: "#fff"
                    }}
                >
                    {
                        !hasUploadError && (
                            <Progress percent={percentage} />
                        )
                    }
                    {
                        hasUploadError && (
                            <Progress status="exception" percent={percentage} />
                        )
                    }
                    {
                        isUploading && (
                            <div>
                                <div>Item(s) remaining: {remainingFiles}</div>
                                <p>This may take a while ...</p>
                                <p style={{ fontWeight: "bold" }}>Do not close the browser</p>
                                <LoadingIcon />
                            </div>)
                    }
                    {
                        !isUploading && !hasUploadError && (
                            <div>
                                <p>Done. Streamer job submitted.</p>
                            </div>)
                    }
                    {
                        !isUploading && hasUploadError && (
                            <div>
                                <p>Failed</p>
                            </div>)
                    }
                </Modal>
                <Modal
                    title="Warning"
                    visible={showFilesExistModal}
                    closable={false}
                    footer={[
                        <div key="buttons" style={{ height: "auto" }}>
                            <Row>
                                <Col span={12} style={{ textAlign: "left" }}>
                                    <Button
                                        onClick={() => { handleCancelFilesExistModal(); }}
                                    >
                                        Cancel
                                    </Button>
                                </Col>
                                <Col span={12} style={{ textAlign: "right" }}>
                                    <Button
                                        type="primary"
                                        onClick={() => { handleOkFilesExistModal(); }}
                                    >
                                        Ok
                                </Button>
                                </Col>
                            </Row>
                        </div>
                    ]}
                    width={"80%"}
                    style={{
                        left: "0px",
                        top: "50px",
                        height: "100%",
                        overflowY: "initial"
                    }}
                    bodyStyle={{
                        height: "80vh",
                        overflowY: "auto",
                        backgroundColor: "#fff"
                    }}
                >
                    <div>Overwrite the following file(s) in existing destination?</div>
                    <TargetPath
                        uploadState={uploadState}
                    />
                    <div style={{ marginTop: "20px" }}>
                        <ExistingFilesList existingFiles={existingFiles} />
                    </div>
                </Modal>
                <Modal
                    title="Error"
                    visible={showErrorModal}
                    closable={false}
                    footer={[
                        <div key="buttons" style={{ height: "auto" }}>
                            <Row>
                                <Col span={24} style={{ textAlign: "right" }}>
                                    <Button
                                        type="primary"
                                        onClick={() => { handleOkErrorModal(); }}
                                    >
                                        Ok
                                    </Button>
                                </Col>
                            </Row>
                        </div>
                    ]}
                >
                    <div>{uploadErrorMessage}</div>
                </Modal>
            </Content>
        </React.Fragment >
    );
};

export default Uploader;
