import React, { useState, useContext, useEffect } from "react";
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
    Tooltip,
    List
} from "antd";

import { AuthContext, IAuthContext } from "../../../../services/auth/auth";
import { UploaderContext, IUploaderContext } from "../../../../services/uploader/UploaderContext";

import Header from "../../../../components/Header/Header";
import FileSelector from "../../components/FileSelector/FileSelector";
import FileList from "../../components/FileList/FileList";
import TargetPath from "../../components/TargetPath/TargetPath";
import StructureSelector from "../../components/StructureSelector/StructureSelector";

import {
    Project,
    RcFile,
    SelectOption,
    UploadSession,
    ValidationResult,
    AddFileResult,
    SubmitResult,
    ServerResponse
} from "../../../../types/types";

import { fetchProjectList } from "../../services/pdb/pdb";

import {
    maxSizeLimitBytes,
    maxSizeLimitAsString,
    detectFile,
    initiate,
    validate,
    addFile,
    finalize,
    submit
} from "../../services/upload/upload";

import {
    validateSubjectLabelInput,
    validateSessionLabelInput,
    validateSelectedDataTypeOtherInput
} from "../../services/inputValidation/inputValidation";

const { Content } = Layout;

const Uploader: React.FC = () => {
    const authContext: IAuthContext | null = useContext(AuthContext);
    const uploaderContext: IUploaderContext | null = useContext(UploaderContext);

    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showFilesExistModal, setShowFilesExistModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [filesExistMessage, setFilesExistMessage] = useState(<div></div>);
    const [errorMessage, setErrorMessage] = useState("");

    const [uploadingPercentage, setUploadingPercentage] = useState(0);
    const [remainingItems, setRemainingItems] = useState(0);
    const [isUploading, setIsUploading] = useState(true);
    const [failed, setFailed] = useState(false);
    const [proceed, setProceed] = useState(false);

    const antIcon = <Icon type="loading" style={{ fontSize: 24, margin: 10 }} spin />;

    useEffect(() => {
        const fetchProjects = async (username: string, password: string) => {
            if (uploaderContext!.projectList!.length < 1) {
                // Only fetch the data when the project list is yet empty
                console.log(`Fetching projects for ${username} ...`);

                await uploaderContext!.setIsLoadingProjectList(true);

                let newProjectList = [] as Project[];
                try {
                    newProjectList = await fetchProjectList(username, password);
                } catch (err) {
                    console.error(err);
                    const newErrorMessage = JSON.stringify(err);
                    setErrorMessage(newErrorMessage);
                    setShowErrorModal(true);

                } finally {
                    newProjectList.forEach((project: Project) => {
                        console.log(project.projectNumber);
                    });
                    await uploaderContext!.setProjectList(newProjectList);
                    await uploaderContext!.setIsLoadingProjectList(false);
                }
            }
        };
        fetchProjects(authContext!.username, authContext!.password);

    }, [authContext]);

    useEffect(() => {
        const checkProceed = async () => {
            if (!(uploaderContext!.hasFilesSelected)) {
                setProceed(false);
                return; // Abort
            }
            if (uploaderContext!.selectedProjectStatus !== "success") {
                setProceed(false);
                return; // Abort
            }
            if (uploaderContext!.selectedSubjectStatus !== "success") {
                setProceed(false);
                return; // Abort
            }
            if (uploaderContext!.selectedSessionStatus !== "success") {
                setProceed(false);
                return; // Abort
            }
            if (uploaderContext!.selectedDataTypeStatus !== "success") {
                setProceed(false);
                return; // Abort
            }
            let dataTypeOk = false;
            if (uploaderContext!.isSelectedDataTypeOther) {
                dataTypeOk = (uploaderContext!.selectedDataTypeStatus === "success" &&
                    uploaderContext!.selectedDataTypeOtherStatus === "success" &&
                    uploaderContext!.selectedDataTypeValue !== "") ? true : false;
            }
            else {
                dataTypeOk = uploaderContext!.selectedDataTypeStatus === "success" ? true : false;
            }
            if (!dataTypeOk) {
                setProceed(false);
                return; // Abort
            }

            setProceed(true);
        };
        checkProceed();
    }, [uploaderContext]);

    const handleSignOut = async () => {
        const username = authContext!.username;
        const password = authContext!.password;

        let result: ServerResponse;
        try {
            result = await authContext!.signOut(username, password);
        } catch (err) {
            console.error('Sign out failure');
            console.error(err);
            const newErrorMessage = JSON.stringify(err);
            setErrorMessage(newErrorMessage);
            setShowErrorModal(true);
            setIsUploading(false);
            setFailed(true);
            return; // Abort
        }

        // Double check result for errors
        if (result.error) {
            console.error('Sign out failure');
            const newErrorMessage = result.error as string;
            console.error(newErrorMessage);
            setErrorMessage(newErrorMessage);
            setShowErrorModal(true);
            setIsUploading(false);
            setFailed(true);
            return; // Abort
        }

        setIsUploading(false);
        setFailed(false);
        console.log('Successfully signed out');
    };

    const handleAddFile = async (file: RcFile, uploadSession: UploadSession) => {

        console.log(`Upload session: ${uploadSession.uploadSessionId}; upload file: ${file.name}`);
        console.dir(uploadSession);

        let addFileResult: AddFileResult;
        try {
            addFileResult = await addFile(
                authContext!.username,
                authContext!.password,
                uploadSession,
                file);
        } catch (err) {
            throw err;
        }

        // Derive percentage done and remaining files
        let newUploadingPercentage = 100;
        if (uploadSession.totalSizeBytes > 0) {
            const fileSizeBytes = file.size;
            uploadingPercentage + Math.floor(100.0 * fileSizeBytes / uploadSession.totalSizeBytes)
        }
        setUploadingPercentage(newUploadingPercentage);
        setRemainingItems(remainingItems => remainingItems - 1);

        return addFileResult;
    };

    // Handle the actual upload (i.e. with user approval if needed).
    // 1. Upload all files to the streamer buffer.
    // 2. Finalize the upload session. 
    // 3. Submit a streamer job to take care of the transfer of files in the background 
    //    (i.e. to the project storage folder and the Donders Repository)
    const handleApprovedUpload = async (uploadSession: UploadSession) => {

        console.log("Prepare the uploading to the streamer buffer");
        let uploadWork = [] as Promise<AddFileResult>[];

        uploaderContext!.fileList.forEach((file: RcFile) => {
            uploadWork.push(handleAddFile(file, uploadSession));
        });

        console.log("Upload all files to the streamer buffer");
        try {
            await Promise.all(uploadWork);
        } catch (err) {
            throw err;
        } finally {
            setRemainingItems(0);
            setUploadingPercentage(100);
        }

        console.log("Finalize the upload session");
        try {
            await finalize(
                authContext!.username,
                authContext!.password,
                uploadSession
            );
        } catch (err) {
            throw err;
        }

        console.log("Submit a streamer job");
        let submitResult: SubmitResult;
        try {
            submitResult = await submit(
                authContext!.username,
                authContext!.password,
                uploadSession
            );
        } catch (err) {
            throw err;
        }

        console.log("Successfully submitted streamer job for files: " + JSON.stringify(submitResult.fileNames));

        setIsUploading(false);
        setFailed(false);
    };

    // Handle the upload request. 
    // 1. Initiate the upload
    // 2. Validate the files to be uploaded
    // 3. Check if user confirmation is needed to overwite an existing project storage folder and files
    // 4. If all green, proceed with the actual upload
    const handleUpload = async () => {
        setShowFilesExistModal(false);
        setFailed(false);
        setRemainingItems(uploaderContext!.fileList.length);
        setUploadingPercentage(0);
        setIsUploading(true);
        setShowUploadModal(true);

        // Initiate the upload
        let uploadSession: UploadSession;
        try {
            uploadSession = await initiate(
                authContext!.username,
                authContext!.password,
                uploaderContext!.selectedProjectValue,
                uploaderContext!.selectedSubjectValue,
                uploaderContext!.selectedSessionValue,
                uploaderContext!.selectedDataTypeValue,
                uploaderContext!.fileList);
        } catch (err) {
            console.error(err);
            const newErrorMessage = JSON.stringify(err);
            setErrorMessage(newErrorMessage);
            setShowErrorModal(true);
            setIsUploading(false);
            setFailed(true);
            return; // Abort
        }

        // Update state
        await uploaderContext!.setUploadSessionId(uploadSession.uploadSessionId);
        await uploaderContext!.setTotalSizeBytes(uploadSession.totalSizeBytes);

        console.log(`Upload session: ${uploaderContext!.uploadSessionId}`);
        console.log(`Upload session: ${uploadSession.uploadSessionId}`);
        console.dir(uploadSession);

        // Validate the files to be uploaded, one by one
        let validationResult: ValidationResult;
        try {
            validationResult = await validate(
                authContext!.username,
                authContext!.password,
                uploadSession,
                uploaderContext!.fileList);
        } catch (err) {
            console.error(err);
            const newErrorMessage = JSON.stringify(err);
            setErrorMessage(newErrorMessage);
            setShowErrorModal(true);
            setIsUploading(false);
            setFailed(true);
            return; // Abort
        }

        console.log(`Upload session: ${uploaderContext!.uploadSessionId}`);
        console.dir(validationResult);
        console.log(validationResult.existingFiles);
        console.log(validationResult.existingFiles.length > 0);

        // Before continuing the actual upload, 
        // check if user confirmation is needed 
        // to overwite an existing project storage folder and files (if any)
        if (validationResult.existingFiles.length > 0) {
            let newExistingFilesAsDiv = <div style={{ marginTop: "20px" }}>
                <List
                    size="small"
                    dataSource={validationResult.existingFiles}
                    renderItem={(existingFile: string) => <List.Item>{existingFile}</List.Item>}
                />
            </div>;

            setFilesExistMessage(existingFilesAsDiv => newExistingFilesAsDiv);
            setShowFilesExistModal(true);
            return; // Abort
        }

        // No user confirmation is needed. Proceed.
        handleApprovedUpload(uploadSession)
            .catch((err) => {
                console.error(err);
                const newErrorMessage = JSON.stringify(err);
                setErrorMessage(newErrorMessage);
                setShowErrorModal(true);
                setIsUploading(false);
                setFailed(true);
            });
    }

    // Remove a file from the file list presented in the UI
    const handleDelete = async (uid: string, filename: string, size: number) => {
        const fileListUpdated = uploaderContext!.fileList.filter(
            (item: RcFile) => item.name !== filename && item.uid !== uid
        );
        const hasFilesSelectedUpdated = fileListUpdated.length > 0;
        await uploaderContext!.setHasFilesSelected(hasFilesSelectedUpdated);
        await uploaderContext!.setFileList(fileListUpdated);
        await uploaderContext!.setFileListSummary(uploaderContext!.fileListSummary - size);
    };

    // Remove the whole file list presented in the UI
    const handleDeleteList = async () => {
        await uploaderContext!.setHasFilesSelected(false);
        await uploaderContext!.setFileList([] as RcFile[]);
        await uploaderContext!.setFileListSummary(0);
    };

    // Check if the file already exists in the file list presented in the UI
    const fileNameExists = (file: RcFile, fileList: RcFile[]) => {
        const duplicates = fileList.filter(
            item => item.name === file.name && item.uid !== file.uid
        );
        if (duplicates.length > 0) {
            return true;
        } else {
            return false;
        }
    };

    // Helper function for file selector
    const handleBeforeUpload = async (file: RcFile, batch: RcFile[]) => {
        let batchSizeBytes = 0;
        let isValidBatch = true;
        let maxFileSizeExceeded = false;
        let directories = [] as string[];
        let largeFiles = [] as string[];
        let duplicates = [] as string[];

        // TODO: Find a way to do this check only once (i.e. per batch)
        for (let i = 0; i < batch.length; i++) {
            batchSizeBytes += file.size;

            // Make sure that the file is not a directory
            const isFile = await detectFile(file);
            if (!isFile) {
                directories.push(batch[i].name);
                isValidBatch = false;
            }

            // Check if file is not too big
            if (file.size >= maxSizeLimitBytes) {
                largeFiles.push(batch[i].name);
                maxFileSizeExceeded = true;
                isValidBatch = false;
            }

            // Check if a file with the same filename exists already
            if (fileNameExists(batch[i], uploaderContext!.fileList)) {
                duplicates.push(batch[i].name);
                isValidBatch = false;
            }
        }

        if (isValidBatch) {
            await uploaderContext!.setHasFilesSelected(true);
            await uploaderContext!.setFileList([...(uploaderContext!.fileList), ...batch]);
            await uploaderContext!.setFileListSummary(uploaderContext!.fileListSummary + batchSizeBytes);
        } else {
            await uploaderContext!.setFileList([...(uploaderContext!.fileList)]);
            await uploaderContext!.setHasFilesSelected(uploaderContext!.fileList.length > 0);
            await uploaderContext!.setFileListSummary(uploaderContext!.fileListSummary);
            let msg = "";
            if (directories.length > 0) {
                if (directories.length === 1) {
                    msg = `Selected item is a directory, please select files only: "${directories[0]}"`;
                } else {
                    msg = `Selected items are directories, please select files only: [${directories.join(", ")}]`;
                }
                setErrorMessage(msg);
                setShowErrorModal(true);
            }
            if (directories.length === 0 && duplicates.length > 0) {
                if (duplicates.length === 1) {
                    msg = `Filename already exists: "${duplicates[0]}"`;
                } else {
                    msg = `Filenames already exist: [${duplicates.join(", ")}]`;
                }
                setErrorMessage(msg);
                setShowErrorModal(true);
            }
            if (directories.length === 0 && duplicates.length === 0 && maxFileSizeExceeded) {
                if (largeFiles.length === 1) {
                    msg = `Maximum file size exceeded (file size must be less than ${maxSizeLimitAsString} for a single file): "${largeFiles[0]}"`;
                } else {
                    msg = `Maximum file size exceeded (file size must be less than ${maxSizeLimitAsString} for a single file): [${largeFiles.join(", ")}]`;
                }
                setErrorMessage(msg);
                setShowErrorModal(true);
            }
        }
    };

    // Deal with project selection drop down
    const handleSelectProject = async (projectNumber: string) => {
        await uploaderContext!.setSelectedProjectStatus("success");
        await uploaderContext!.setSelectedProjectValue(projectNumber);
        await uploaderContext!.setIsSelectedProject(true);
        // Reset the other fields
        await uploaderContext!.setSelectedSubjectValue("");
        await uploaderContext!.setIsSelectedSubject(false);
        await uploaderContext!.setSelectedSessionValue("");
        await uploaderContext!.setIsSelectedSession(false);
        await uploaderContext!.setSelectedDataTypeValue("");
        await uploaderContext!.setIsSelectedDataType(false);
        await uploaderContext!.setIsSelectedDataTypeOther(false);
        setProceed(false);
    };

    // Deal with subject label free text input
    const handleChangeSubjectLabel = async (subjectLabel: string) => {
        await uploaderContext!.setSelectedSubjectStatus("validating");
        let isValid = validateSubjectLabelInput(subjectLabel);
        if (isValid) {
            await uploaderContext!.setSelectedSubjectStatus("success");
            await uploaderContext!.setSelectedSubjectValue(subjectLabel);
            await uploaderContext!.setIsSelectedSubject(true);
        } else {
            let value = subjectLabel;
            // Silently reset in case of empty string.
            if (value !== "") {
                value = uploaderContext!.selectedSubjectValue;
            }
            await uploaderContext!.setSelectedSubjectStatus("error");
            await uploaderContext!.setSelectedSubjectValue(value);
            await uploaderContext!.setIsSelectedSubject(false);
        }
    };

    // Deal with session label free text input
    const handleChangeSessionLabel = async (sessionLabel: string) => {
        await uploaderContext!.setSelectedSessionStatus("validating");
        let isValid = validateSessionLabelInput(sessionLabel);
        if (isValid) {
            await uploaderContext!.setSelectedSessionStatus("success");
            await uploaderContext!.setSelectedSessionValue(sessionLabel);
            await uploaderContext!.setIsSelectedSession(true);
        } else {
            let value = sessionLabel;
            // Silently reset in case of empty string.
            if (value !== "") {
                value = uploaderContext!.selectedSessionValue;
            }
            await uploaderContext!.setSelectedSessionStatus("error");
            await uploaderContext!.setSelectedSessionValue(value);
            await uploaderContext!.setIsSelectedSession(false);
        }
    };

    // Deal with data type selection drop down and data type other free text input
    const handleSelectDataType = async (dataType: string) => {
        await uploaderContext!.setSelectedDataTypeStatus("success");
        await uploaderContext!.setSelectedDataTypeValue(dataType);
        await uploaderContext!.setIsSelectedDataType(true);
        await uploaderContext!.setSelectedDataTypeOtherStatus("");
        if (dataType === "other") {
            await uploaderContext!.setIsSelectedDataTypeOther(true);
            await uploaderContext!.setSelectedDataTypeValue("");
        } else {
            await uploaderContext!.setIsSelectedDataTypeOther(false);
        }
    };

    // Deal with data type other free text input
    const handleChangeSelectedDataTypeOther = async (dataTypeOther: string) => {
        await uploaderContext!.setSelectedDataTypeOtherStatus("validating");
        let isValid = validateSelectedDataTypeOtherInput(dataTypeOther);
        if (isValid) {
            await uploaderContext!.setSelectedDataTypeOtherStatus("success");
            await uploaderContext!.setSelectedDataTypeValue(dataTypeOther);
        } else {
            let value = dataTypeOther;
            // Silently reset in case of empty string.
            if (value !== "") {
                value = uploaderContext!.selectedDataTypeValue;
            }
            await uploaderContext!.setSelectedDataTypeOtherStatus("error");
            await uploaderContext!.setSelectedDataTypeValue(value);
        }
    };

    return (
        <React.Fragment>
            <Content style={{ background: "#f0f2f5" }}>
                <Header />
                <div style={{ padding: "10px" }}>
                    <Row>
                        <Col span={12}>
                            <Card className="MainCard" style={{ marginRight: "5px" }}>
                                <FileSelector
                                    fileList={uploaderContext!.fileList}
                                    fileListSummary={uploaderContext!.fileListSummary}
                                    hasFilesSelected={uploaderContext!.hasFilesSelected}
                                    handleBeforeUpload={handleBeforeUpload}
                                />
                                <br />
                                <br />
                                <FileList
                                    fileList={uploaderContext!.fileList}
                                    fileListSummary={uploaderContext!.fileListSummary}
                                    hasFilesSelected={uploaderContext!.hasFilesSelected}
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
                                        isSelectedProject={uploaderContext!.isSelectedProject}
                                        isSelectedSubject={uploaderContext!.isSelectedSubject}
                                        isSelectedSession={uploaderContext!.isSelectedSession}
                                        isSelectedDataType={uploaderContext!.isSelectedDataType}
                                        projectNumber={uploaderContext!.selectedProjectValue}
                                        subjectLabel={uploaderContext!.selectedSubjectValue}
                                        sessionLabel={uploaderContext!.selectedSessionValue}
                                        dataType={uploaderContext!.selectedDataTypeValue}
                                    />
                                </Content>
                                {
                                    uploaderContext!.isLoadingProjectList &&
                                    <Content style={{ marginTop: "20px" }}>
                                        <div>Loading projects for {authContext!.username} ...</div>
                                        <Spin indicator={antIcon} />
                                    </Content>
                                }
                                {
                                    !(uploaderContext!.isLoadingProjectList) &&
                                    <Content style={{ marginTop: "20px" }}>
                                        <StructureSelector
                                            projectList={uploaderContext!.projectList}
                                            selectedProjectStatus={uploaderContext!.selectedProjectStatus}
                                            selectedSubjectStatus={uploaderContext!.selectedSubjectStatus}
                                            selectedSessionStatus={uploaderContext!.selectedSessionStatus}
                                            selectedDataTypeStatus={uploaderContext!.selectedDataTypeStatus}
                                            selectedDataTypeOtherStatus={uploaderContext!.selectedDataTypeOtherStatus}
                                            isSelectedProject={uploaderContext!.isSelectedProject}
                                            projectNumber={uploaderContext!.selectedProjectValue}
                                            subjectLabel={uploaderContext!.selectedSubjectValue}
                                            sessionLabel={uploaderContext!.selectedSessionValue}
                                            isSelectedDataTypeOther={uploaderContext!.isSelectedDataTypeOther}
                                            dataType={uploaderContext!.selectedDataTypeValue}
                                            handleSelectProject={handleSelectProject}
                                            handleChangeSubjectLabel={handleChangeSubjectLabel}
                                            handleChangeSessionLabel={handleChangeSessionLabel}
                                            handleSelectDataType={handleSelectDataType}
                                            handleChangeSelectedDataTypeOther={handleChangeSelectedDataTypeOther}
                                        />
                                    </Content>
                                }
                                {
                                    (!(uploaderContext!.hasFilesSelected) || !proceed) && (
                                        <Content style={{ marginTop: "20px" }}>
                                            <Tooltip placement="bottomRight" title="Please select one or more files and set the destination folder settings above. When 1) all source files are selected, and 2) the destination settings above are filled in properly, the button becomes green and clickable.">
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
                                    (uploaderContext!.hasFilesSelected && proceed) && (
                                        <Tooltip placement="bottomRight" title="Press the button to submit a streamer job.">
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
                                        onClick={async () => {
                                            setShowUploadModal(false);

                                            // Keep projectList, projectNumber, subject, session, dataType, etc. but refresh the filelist
                                            await uploaderContext!.setFileList([] as RcFile[]);
                                            await uploaderContext!.setFileListSummary(0);
                                            await uploaderContext!.setHasFilesSelected(false);
                                        }}
                                    >
                                        Upload another batch
                                    </Button>
                                    <Button
                                        disabled={isUploading}
                                        onClick={() => { handleSignOut(); }}
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
                                        onClick={async () => {
                                            setShowFilesExistModal(false);
                                            setFilesExistMessage(<div></div>);
                                            setShowUploadModal(false);

                                            // Keep projectList, projectNumber, subject, session, dataType, etc. but refresh the filelist
                                            await uploaderContext!.setFileList([] as RcFile[]);
                                            await uploaderContext!.setFileListSummary(0);
                                            await uploaderContext!.setHasFilesSelected(false);
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </Col>
                                <Col span={12} style={{ textAlign: "right" }}>
                                    <Button
                                        type="primary"
                                        onClick={() => {
                                            setShowFilesExistModal(false);
                                            setFilesExistMessage(<div></div>);

                                            const uploadSession = {
                                                uploadSessionId: uploaderContext!.uploadSessionId,
                                                username: authContext!.username,
                                                projectNumber: uploaderContext!.selectedProjectValue,
                                                subjectLabel: uploaderContext!.selectedSubjectValue,
                                                sessionLabel: uploaderContext!.selectedSessionValue,
                                                dataType: uploaderContext!.selectedDataTypeValue,
                                                totalSizeBytes: uploaderContext!.totalSizeBytes
                                            } as UploadSession;

                                            // No user confirmation needed, proceed
                                            handleApprovedUpload(uploadSession).catch((err) => {
                                                console.error(err);
                                                const newErrorMessage = JSON.stringify(err);
                                                setErrorMessage(newErrorMessage);
                                                setShowErrorModal(true);
                                                setIsUploading(false);
                                                setFailed(true);
                                            });
                                        }}
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
                        isSelectedProject={uploaderContext!.isSelectedProject}
                        isSelectedSubject={uploaderContext!.isSelectedSubject}
                        isSelectedSession={uploaderContext!.isSelectedSession}
                        isSelectedDataType={uploaderContext!.isSelectedDataType}
                        projectNumber={uploaderContext!.selectedProjectValue}
                        subjectLabel={uploaderContext!.selectedSubjectValue}
                        sessionLabel={uploaderContext!.selectedSessionValue}
                        dataType={uploaderContext!.selectedDataTypeValue}
                    />
                    {filesExistMessage}
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
                                        onClick={() => {
                                            setFailed(true);
                                            setShowErrorModal(false);
                                            setErrorMessage("");
                                        }}
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
