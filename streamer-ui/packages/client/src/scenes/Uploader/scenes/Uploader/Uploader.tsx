import React from "react";

import {
    Layout,
    Row,
    Col,
    Card,
    Icon,
    Button,
    BackTop,
    Spin,
    Modal,
    Progress,
    Tooltip
} from "antd";

import Header from "../../../../components/Header/Header";
import FileSelector from "../../components/FileSelector/FileSelector";
import FileList from "../../components/FileList/FileList";
import TargetPath from "../../components/TargetPath/TargetPath";
import StructureSelector from "../../components/StructureSelector/StructureSelector";

import {
    UserProfile,
    Project,
    RcFile,
    InputValidationStatuses,
    ServerResponse
} from "../../../../types/types";

import "../../../../app/App.less";

const { Content } = Layout;

interface UploaderProps {
    userProfile: UserProfile;
    signOut: (username: string, password: string) => Promise<ServerResponse>;
    handleSignOut: (username: string, password: string) => Promise<void>;
    projectList: Project[];
    isLoadingProjectList: boolean;
    fileList: RcFile[];
    fileListSummary: number;
    hasFilesSelected: boolean;
    handleDelete: (uid: string, filename: string, size: number) => void;
    handleDeleteList: () => void;
    handleBeforeUpload: (file: RcFile, batch: RcFile[]) => boolean | PromiseLike<void>;
    selectedProjectValue: string;
    selectedProjectStatus: (typeof InputValidationStatuses)[number];
    isSelectedProject: boolean;
    selectedSubjectValue: string;
    selectedSubjectStatus: (typeof InputValidationStatuses)[number];
    isSelectedSubject: boolean;
    selectedSessionValue: string;
    selectedSessionStatus: (typeof InputValidationStatuses)[number];
    isSelectedSession: boolean;
    selectedDataTypeValue: string;
    selectedDataTypeStatus: (typeof InputValidationStatuses)[number];
    isSelectedDataType: boolean;
    selectedDataTypeOtherStatus: (typeof InputValidationStatuses)[number];
    isSelectedDataTypeOther: boolean;
    handleSelectProject: (projectNumber: string) => void;
    handleChangeSubjectLabel: (subjectLabel: string) => void;
    handleChangeSessionLabel: (sessionLabel: string) => void;
    handleSelectDataType: (dataType: string) => void;
    handleChangeDataTypeOther: (dataTypeOther: string) => void;
    proceed: boolean;
    handleUpload: () => Promise<void>;
    handleUploadAnotherBatch: () => void;
    showUploadModal: boolean;
    isUploading: boolean;
    uploadingPercentage: number;
    remainingItems: number;
    failed: boolean;
    showFilesExistModal: boolean;
    existingFilesList: JSX.Element;
    handleCancelFilesExistModal: () => void;
    handleOkFilesExistModal: () => void;
    showErrorModal: boolean;
    errorMessage: string;
    handleOkErrorModal: () => void;
}

const Uploader: React.FC<UploaderProps> = ({
    userProfile,
    signOut,
    handleSignOut,
    projectList,
    isLoadingProjectList,
    fileList,
    fileListSummary,
    hasFilesSelected,
    handleDelete,
    handleDeleteList,
    handleBeforeUpload,
    selectedProjectValue,
    selectedProjectStatus,
    isSelectedProject,
    selectedSubjectValue,
    selectedSubjectStatus,
    isSelectedSubject,
    selectedSessionValue,
    selectedSessionStatus,
    isSelectedSession,
    selectedDataTypeValue,
    selectedDataTypeStatus,
    isSelectedDataType,
    selectedDataTypeOtherStatus,
    isSelectedDataTypeOther,
    handleSelectProject,
    handleChangeSubjectLabel,
    handleChangeSessionLabel,
    handleSelectDataType,
    handleChangeDataTypeOther,
    proceed,
    handleUpload,
    handleUploadAnotherBatch,
    showUploadModal,
    isUploading,
    uploadingPercentage,
    remainingItems,
    failed,
    showFilesExistModal,
    existingFilesList,
    handleCancelFilesExistModal,
    handleOkFilesExistModal,
    showErrorModal,
    errorMessage,
    handleOkErrorModal
}) => {

    const antIcon = <Icon type="loading" style={{ fontSize: 24, margin: 10 }} spin />;

    return (
        <React.Fragment>
            <Content style={{ background: "#f0f2f5" }}>
                <Header userProfile={userProfile} signOut={signOut} />
                <div style={{ padding: "10px" }}>
                    <Row>
                        <Col span={12}>
                            <Card className="MainCard" style={{ marginRight: "5px" }}>
                                <FileSelector
                                    fileList={fileList}
                                    fileListSummary={fileListSummary}
                                    hasFilesSelected={hasFilesSelected}
                                    handleBeforeUpload={handleBeforeUpload}
                                />
                                <br />
                                <br />
                                <FileList
                                    fileList={fileList}
                                    fileListSummary={fileListSummary}
                                    hasFilesSelected={hasFilesSelected}
                                    handleDelete={handleDelete}
                                    handleDeleteList={handleDeleteList}
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
                                        isSelectedProject={isSelectedProject}
                                        isSelectedSubject={isSelectedSubject}
                                        isSelectedSession={isSelectedSession}
                                        isSelectedDataType={isSelectedDataType}
                                        projectNumber={selectedProjectValue}
                                        subjectLabel={selectedSubjectValue}
                                        sessionLabel={selectedSessionValue}
                                        dataType={selectedDataTypeValue}
                                    />
                                </Content>
                                {
                                    isLoadingProjectList &&
                                    <Content style={{ marginTop: "20px" }}>
                                        <div>Loading projects for {userProfile.username} ...</div>
                                        <Spin indicator={antIcon} />
                                    </Content>
                                }
                                {
                                    !isLoadingProjectList &&
                                    <Content style={{ marginTop: "20px" }}>
                                        <StructureSelector
                                            projectList={projectList}
                                            projectNumber={selectedProjectValue}
                                            selectedProjectStatus={selectedProjectStatus}
                                            isSelectedProject={isSelectedProject}
                                            subjectLabel={selectedSubjectValue}
                                            selectedSubjectStatus={selectedSubjectStatus}
                                            sessionLabel={selectedSessionValue}
                                            selectedSessionStatus={selectedSessionStatus}
                                            dataType={selectedDataTypeValue}
                                            selectedDataTypeStatus={selectedDataTypeStatus}
                                            selectedDataTypeOtherStatus={selectedDataTypeOtherStatus}
                                            isSelectedDataTypeOther={isSelectedDataTypeOther}
                                            handleSelectProject={handleSelectProject}
                                            handleChangeSubjectLabel={handleChangeSubjectLabel}
                                            handleChangeSessionLabel={handleChangeSessionLabel}
                                            handleSelectDataType={handleSelectDataType}
                                            handleChangeDataTypeOther={handleChangeDataTypeOther}
                                        />
                                    </Content>
                                }
                                {
                                    (!hasFilesSelected || !proceed) && (
                                        <Content style={{ marginTop: "20px" }}>
                                            <Tooltip
                                                placement="bottomRight"
                                                title="Please select one or more files and set the destination folder settings above. When 1) all source files are selected, and 2) the destination settings above are filled in properly, the button becomes green and clickable."
                                            >
                                                <Button
                                                    disabled={true}
                                                    size="large"
                                                    style={{ width: "200px", float: "right" }}
                                                >
                                                    Upload
                                                </Button>
                                            </Tooltip>
                                        </Content>
                                    )}
                                {
                                    (hasFilesSelected && proceed) && (
                                        <Tooltip
                                            placement="bottomRight"
                                            title="Press the button to submit a streamer job."
                                        >
                                            <Button
                                                size="large"
                                                style={{
                                                    backgroundColor: "#52c41a",
                                                    color: "#fff",
                                                    width: "200px",
                                                    float: "right"
                                                }}
                                                onClick={() => { handleUpload(); }}
                                            >
                                                Upload
                                            </Button>
                                        </Tooltip>
                                    )}
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
                        !failed && (
                            <Progress percent={uploadingPercentage} />
                        )
                    }
                    {
                        failed && (
                            <Progress status="exception" percent={uploadingPercentage} />
                        )
                    }
                    {
                        isUploading && (
                            <div>
                                <div>Item(s) remaining: {remainingItems}</div>
                                <p>This may take a while ...</p>
                                <p style={{ fontWeight: "bold" }}>Do not close the browser</p>
                                <Spin indicator={antIcon} />
                            </div>)
                    }
                    {
                        !isUploading && !failed && (
                            <div>
                                <p>Done. Streamer job submitted.</p>
                            </div>)
                    }
                    {
                        !isUploading && failed && (
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
                        isSelectedProject={isSelectedProject}
                        isSelectedSubject={isSelectedSubject}
                        isSelectedSession={isSelectedSession}
                        isSelectedDataType={isSelectedDataType}
                        projectNumber={selectedProjectValue}
                        subjectLabel={selectedSubjectValue}
                        sessionLabel={selectedSessionValue}
                        dataType={selectedDataTypeValue}
                    />
                    <div style={{ marginTop: "20px" }}>
                        {existingFilesList}
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
                    <div>{errorMessage}</div>
                </Modal>
            </Content>
        </React.Fragment >
    );
};

export default Uploader;
