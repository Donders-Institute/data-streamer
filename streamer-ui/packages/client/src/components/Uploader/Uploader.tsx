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
import axios, { AxiosError, AxiosResponse, AxiosRequestConfig } from "axios";

import { AuthContext } from "../Auth/AuthContext";
import { UploaderContext } from "./UploaderContext";

import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import FileSelector from "./FileSelector";
import FileList from "./FileList";
import TargetPath from "./TargetPath";
import StructureSelector from "./StructureSelector";
import { RcFile, ValidatedFile, SelectOption, UploadSession, UploadWork } from "./types";
import { validateSubjectLabelInput, validateSessionLabelInput, validateSelectedDataTypeOtherInput } from "./utils";
import { fetchProjectList } from "./fetch";

const { Content } = Layout;

// 1 GB = 1024 * 1024 * 1024 bytes = 1073741824 bytes
const maxSizeLimitBytes = 1073741824;
const maxSizeLimitAsString = "1 GB";

// 5 minutes = 5 * 60 * 1000 ms = 300000 ms
const uploadTimeout = 300000;

const detectFile = (file: RcFile) => {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.onloadstart = () => {
            // is file
            resolve(true);
        };
        reader.onerror = (e) => {
            // is directory
            resolve(false);
        };
        reader.readAsArrayBuffer(file);
    });
};

const Uploader: React.FC = () => {
    const authContext = useContext(AuthContext);
    const uploaderContext = useContext(UploaderContext);

    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showFilesExistModal, setShowFilesExistModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [filesExistMessage, setFilesExistMessage] = useState(<div></div>);
    const [errorMessage, setErrorMessage] = useState("");
    const [uploadingPercentage, setUploadingPercentage] = useState(0);
    const [totalSizeBytes, setTotalSizeBytes] = useState(0);
    const [remainingItems, setRemainingItems] = useState(0);
    const [isUploading, setIsUploading] = useState(true);
    const [failed, setFailed] = useState(false);
    const [proceed, setProceed] = useState(false);
    const [uploadWork, setUploadWork] = useState({
        newTotalSizeBytes: 0,
        work: [] as Promise<unknown>[],
        uploadSessionId: 0,
        uploadSession: {
            username: "",
            ipAddress: "",
            projectNumber: "",
            subjectLabel: "",
            sessionLabel: "",
            dataType: ""
        } as UploadSession
    });

    const antIcon = <Icon type="loading" style={{ fontSize: 24, margin: 10 }} spin />;

    useEffect(() => {
        const fetchData = async (username: string, password: string) => {
            if (!(uploaderContext!.projectList)) {
                // Only fetch the data when the project list does not yet exist
                uploaderContext!.setIsLoadingProjectList(true);
                const newProjectList = await fetchProjectList(username, password);
                uploaderContext!.setProjectList(newProjectList);
                uploaderContext!.setIsLoadingProjectList(false);
            }
        };
        fetchData(authContext!.username, authContext!.password);
    }, [authContext]);

    useEffect(() => {
        const checkProceed = async () => {
            if (!(uploaderContext!.hasFilesSelected)) {
                setProceed(false);
                return;
            }
            if (uploaderContext!.selectedProjectStatus !== "success") {
                setProceed(false);
                return;
            }
            if (uploaderContext!.selectedSubjectStatus !== "success") {
                setProceed(false);
                return;
            }
            if (uploaderContext!.selectedSessionStatus !== "success") {
                setProceed(false);
                return;
            }
            if (uploaderContext!.selectedDataTypeStatus !== "success") {
                setProceed(false);
                return;
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
                return;
            }
            setProceed(true);
        };
        checkProceed();
    }, [uploaderContext]);

    const handleUploadSessionResponse = (response: AxiosResponse) => {
        // console.log(response.data);
        // console.log(response.status);
        // console.log(response.statusText);
        // console.log(response.headers);
        // console.log(response.config);
        return response;
    };

    const handleUploadSessionError = (error: AxiosError) => {
        var newErrorMessage = "could not connect to data streamer UI server";
        if (error.response) {
            // console.log(error.response.data);
            // console.log(error.response.status);
            // console.log(error.response.headers);
            if (error.response.data) {
                newErrorMessage = JSON.stringify(error.response.data, null, 2);
            }
        } else {
            console.log(error!.message);
            newErrorMessage = error.message;
        }
        console.log(newErrorMessage);
        setErrorMessage(errorMessage => newErrorMessage);
        setShowErrorModal(true);
        setFailed(true);
        setIsUploading(false);
        return error;
    };

    const handleUploadSessionBeginRequest = (username: string, password: string, uploadSession: UploadSession) => {
        let promise = new Promise((resolve, reject) => {
            const config: AxiosRequestConfig = {
                url: "/begin",
                method: "post",
                headers: { "Content-Type": "application/json" },
                data: uploadSession,
                timeout: uploadTimeout,
                withCredentials: true,
                auth: {
                    username: username,
                    password: password
                },
                responseType: "json"
            };

            resolve(axios.request(config)
                .then(handleUploadSessionResponse)
                .then(function (response: AxiosResponse) {
                    const uploadSessionId = response!.data!.data!.uploadSessionId;
                    return uploadSessionId;
                })
                .catch(handleUploadSessionError));
        });
        return promise;
    };

    const handleValidationRequest = (username: string, password: string, formData: any) => {
        let promise = new Promise((resolve, reject) => {
            const config: AxiosRequestConfig = {
                url: "/validatefile",
                method: "post",
                headers: { "Content-Type": "multipart/form-data" },
                data: formData,
                timeout: uploadTimeout,
                withCredentials: true,
                auth: {
                    username: username,
                    password: password
                },
                responseType: "json"
            };

            resolve(axios.request(config)
                .then(handleUploadSessionResponse)
                .then(function (response: AxiosResponse) {
                    const validatedFile = response!.data!.data!;
                    return validatedFile as ValidatedFile;
                })
                .catch(handleUploadSessionError));
        });
        return promise;
    };

    const handleUploadRequest = (username: string, password: string, formData: any, fileSizeBytes: number) => {
        let promise = new Promise((resolve, reject) => {
            const config: AxiosRequestConfig = {
                url: "/addfile",
                method: "post",
                headers: { "Content-Type": "multipart/form-data" },
                data: formData,
                timeout: uploadTimeout,
                withCredentials: true,
                auth: {
                    username: username,
                    password: password
                },
                responseType: "json"
            };

            resolve(axios.request(config)
                .then(handleUploadSessionResponse)
                .then(function (response: AxiosResponse) {
                    let value = totalSizeBytes > 0 ? uploadingPercentage + Math.floor(100.0 * fileSizeBytes / totalSizeBytes) : 100;
                    setUploadingPercentage(uploadingPercentage => value);
                    setRemainingItems(remainingItems => remainingItems - 1);
                    return value;
                })
                .catch(handleUploadSessionError));
        });
        return promise;
    };

    const handleUploadSessionFinalizeRequest = (username: string, password: string, uploadSessionId: number) => {
        let promise = new Promise((resolve, reject) => {
            const config: AxiosRequestConfig = {
                url: "/finalize",
                method: "post",
                headers: { "Content-Type": "application/json" },
                data: {
                    "uploadSessionId": uploadSessionId
                },
                timeout: uploadTimeout,
                withCredentials: true,
                auth: {
                    username: username,
                    password: password
                },
                responseType: "json"
            };

            resolve(axios.request(config)
                .then(handleUploadSessionResponse)
                .then(function (response: AxiosResponse) {
                    return true;
                })
                .catch(handleUploadSessionError));
        });
        return promise;
    };

    const handleUploadSessionSubmitRequest = (username: string, password: string, uploadSessionId: number, uploadSession: UploadSession) => {
        let promise = new Promise((resolve, reject) => {
            const config: AxiosRequestConfig = {
                url: "/submit",
                method: "post",
                headers: { "Content-Type": "application/json" },
                data: {
                    ...uploadSession,
                    "uploadSessionId": uploadSessionId
                },
                timeout: uploadTimeout,
                withCredentials: true,
                auth: {
                    username: username,
                    password: password
                },
                responseType: "json"
            };

            resolve(axios.request(config)
                .then(handleUploadSessionResponse)
                .then(function (response: AxiosResponse) {
                    const uploadFiles = response!.data!.data!.files;
                    return uploadFiles;
                })
                .catch(handleUploadSessionError));
        });
        return promise;
    };

    function dummyAxiosRequest<T = any, R = AxiosResponse<T>>(config: AxiosRequestConfig): Promise<R> {
        const promise = new Promise<R>(function (resolve, reject) {
            setTimeout(function () {
                let response = {
                    data: { test: "test" },
                    status: 200,
                    statusText: "OK",
                    headers: {},
                    config: config
                } as unknown as (R | PromiseLike<R> | undefined);
                resolve(response);
            }, 2000);
        });
        return promise;
    }

    const handleDummyValidationRequest = (username: string, password: string, formData: any) => {
        let promise = new Promise((resolve, reject) => {
            const config: AxiosRequestConfig = {
                url: "/validateFile",
                method: "post",
                headers: { "Content-Type": "multipart/form-data" },
                data: formData,
                timeout: uploadTimeout,
                withCredentials: true,
                auth: {
                    username: username,
                    password: password
                },
                responseType: "json"
            };

            resolve(dummyAxiosRequest(config)
                .then(handleUploadSessionResponse)
                .then(function (response: AxiosResponse) {
                    const validatedFile = response!.data!.data!;
                    return validatedFile as ValidatedFile;
                })
                .catch(handleUploadSessionError));
        });
        return promise;
    };

    // Upload files in parallel
    const handleRealUpload = async () => {
        setTotalSizeBytes(totalSizeBytes => uploadWork.newTotalSizeBytes);

        await Promise.all(uploadWork.work)
            .then(function (results) {
                setRemainingItems(remainingItems => 0);
                setUploadingPercentage(uploadingPercentage => 100);
                setTotalSizeBytes(totalSizeBytes => 0);
            });

        // Finalize the upload session
        console.log("Finalize upload");
        await handleUploadSessionFinalizeRequest(authContext!.username, authContext!.password, uploadWork.uploadSessionId);

        // Submit the streamer job
        console.log("Submitting streamer job");
        const submitResult = await handleUploadSessionSubmitRequest(authContext!.username, authContext!.password, uploadWork.uploadSessionId, uploadWork.uploadSession);

        let result = submitResult as any;
        let error = result!.message;
        if (error) {
            console.error(error);

            setIsUploading(false);
            setFailed(true);
        } else {
            const uploadedFiles = submitResult as string[];
            console.log("Successfully submitted streamer job for files: " + JSON.stringify(uploadedFiles));

            setIsUploading(false);
            setFailed(false);
        }
    }

    const handleUpload = async (event: any) => {
        setShowFilesExistModal(false);
        setFailed(false);
        setRemainingItems(remainingItems => uploaderContext!.fileList.length);
        setUploadingPercentage(uploadingPercentage => 0);
        setIsUploading(true);
        setShowUploadModal(true);

        const uploadSession = {
            username: authContext!.username,
            ipAddress: authContext!.ipAddress,
            projectNumber: uploaderContext!.selectedProjectValue,
            subjectLabel: uploaderContext!.selectedSubjectValue,
            sessionLabel: uploaderContext!.selectedSessionValue,
            dataType: uploaderContext!.selectedDataTypeValue
        } as UploadSession;

        // Start the upload session
        console.log("Preparing upload");
        const result = await handleUploadSessionBeginRequest(authContext!.username, authContext!.password, uploadSession);

        // Check result before continuing
        const checkResult = result as any;
        const error = checkResult!.error;
        if (error) {
            console.error(error);
            setIsUploading(false);
            setFailed(true);
        }

        const uploadSessionId = result as number;

        // Prepare the uploading of each file
        console.log("Preparing uploading of files");

        let newTotalSizeBytes = 0;
        let validationWork = [] as Promise<unknown>[];
        let work = [] as Promise<unknown>[];
        uploaderContext!.fileList.forEach((file: any) => {
            var formData = new FormData();

            // Add the attributes
            formData.append("uploadSessionId", uploadSessionId.toLocaleString());
            formData.append("projectNumber", uploaderContext!.selectedProjectValue);
            formData.append("subjectLabel", uploaderContext!.selectedSubjectValue);
            formData.append("sessionLabel", uploaderContext!.selectedSessionValue);
            formData.append("dataType", uploaderContext!.selectedDataTypeValue);

            formData.append("ipAddress", authContext!.ipAddress);
            formData.append("filename", file.name);
            formData.append("filesize", file.size);
            formData.append("uid", file.uid);

            newTotalSizeBytes += file.size;

            // Add one file
            formData.append("files", file);

            // Prepare validation for this file
            const pv = handleValidationRequest(authContext!.username, authContext!.password, formData);
            //  const pv = handleDummyValidationRequest(authContext!.username, authContext!.password, formData);
            validationWork.push(pv.catch(error => {
                console.log(error);
            }));

            // Prepare upload for this file
            const p = handleUploadRequest(authContext!.username, authContext!.password, formData, file.size);
            work.push(p.catch(error => {
                setFailed(true);
                setIsUploading(false);
                console.log(error);
            }));
        });

        const newUploadWork = {
            newTotalSizeBytes: newTotalSizeBytes,
            work: work,
            uploadSessionId: uploadSessionId,
            uploadSession: uploadSession
        } as UploadWork;
        setUploadWork(uploadWork => newUploadWork);

        // Validate each file sequentially if the file in the destination folder already exist
        console.log("Validating files");
        let existingFiles = [] as string[];
        for (let i = 0; i < validationWork.length; i++) {
            let validatedFile = await validationWork[i] as ValidatedFile;
            if (validatedFile!.fileExists) {
                existingFiles.push(validatedFile!.filename);
            }
        }
        if (existingFiles.length > 0) {
            // Handle user confirmation first
            let newExistingFilesAsDiv = <div style={{ marginTop: "20px" }}>
                <List
                    size="small"
                    dataSource={existingFiles}
                    renderItem={(existingFile: string) => <List.Item>{existingFile}</List.Item>}
                />
            </div >;
            setFilesExistMessage(existingFilesAsDiv => newExistingFilesAsDiv);
            setShowFilesExistModal(true);
        } else {
            // No user confirmation required, proceed
            handleRealUpload();
        }
    };

    const handleDelete = (uid: string, filename: string, size: number) => {
        const fileListUpdated = uploaderContext!.fileList.filter(
            (item: any) => item.name !== filename && item.uid !== uid
        );
        const hasFilesSelectedUpdated = fileListUpdated.length > 0;
        uploaderContext!.setHasFilesSelected(hasFilesSelectedUpdated);
        uploaderContext!.setFileList(fileListUpdated);
        uploaderContext!.setFileListSummary(uploaderContext!.fileListSummary - size);
    };

    const handleDeleteList = () => {
        uploaderContext!.setHasFilesSelected(false);
        uploaderContext!.setFileList([] as RcFile[]);
        uploaderContext!.setFileListSummary(0);
    };

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
            uploaderContext!.setHasFilesSelected(true);
            uploaderContext!.setFileList([...(uploaderContext!.fileList), ...batch]);
            uploaderContext!.setFileListSummary(uploaderContext!.fileListSummary + batchSizeBytes);
        } else {
            uploaderContext!.setFileList([...(uploaderContext!.fileList)]);
            uploaderContext!.setHasFilesSelected(uploaderContext!.fileList.length > 0);
            uploaderContext!.setFileListSummary(uploaderContext!.fileListSummary);
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

    const handleSelectProjectValue = (value: SelectOption) => {
        uploaderContext!.setSelectedProjectStatus("success");
        uploaderContext!.setSelectedProjectValue(value.key);
        uploaderContext!.setIsSelectedProject(true);
        // Reset the other fields
        uploaderContext!.setSelectedSubjectValue("");
        uploaderContext!.setIsSelectedSubject(false);
        uploaderContext!.setSelectedSessionValue("");
        uploaderContext!.setIsSelectedSession(false);
        uploaderContext!.setSelectedDataTypeValue("");
        uploaderContext!.setIsSelectedDataType(false);
        uploaderContext!.setIsSelectedDataTypeOther(false);
        setProceed(false);
    };

    const handleChangeSubjectLabel = async (event: any) => {
        uploaderContext!.setSelectedSubjectStatus("validating");
        let isValid = validateSubjectLabelInput(event.target.value);
        if (isValid) {
            uploaderContext!.setSelectedSubjectStatus("success");
            uploaderContext!.setSelectedSubjectValue(event.target.value);
            uploaderContext!.setIsSelectedSubject(true);
        } else {
            let value = event.target.value;
            // Silently reset in case of empty string.
            if (value !== "") {
                value = uploaderContext!.selectedSubjectValue;
            }
            uploaderContext!.setSelectedSubjectStatus("error");
            uploaderContext!.setSelectedSubjectValue(value);
            uploaderContext!.setIsSelectedSubject(false);
        }
    };

    const handleChangeSessionLabel = async (event: any) => {

        uploaderContext!.setSelectedSessionStatus("validating");
        let isValid = validateSessionLabelInput(event.target.value);
        if (isValid) {
            uploaderContext!.setSelectedSessionStatus("success");
            uploaderContext!.setSelectedSessionValue(event.target.value);
            uploaderContext!.setIsSelectedSession(true);
        } else {
            let value = event.target.value;
            // Silently reset in case of empty string.
            if (value !== "") {
                value = uploaderContext!.selectedSessionValue;
            }
            uploaderContext!.setSelectedSessionStatus("error");
            uploaderContext!.setSelectedSessionValue(value);
            uploaderContext!.setIsSelectedSession(false);
        }
    };

    const handleSelectDataTypeValue = async (value: SelectOption) => {
        uploaderContext!.setSelectedDataTypeStatus("success");
        uploaderContext!.setSelectedDataTypeValue(value.key);
        uploaderContext!.setIsSelectedDataType(true);
        uploaderContext!.setSelectedDataTypeOtherStatus("");
        if (value.key === "other") {
            uploaderContext!.setIsSelectedDataTypeOther(true);
            uploaderContext!.setSelectedDataTypeValue("");
        } else {
            uploaderContext!.setIsSelectedDataTypeOther(false);
        }
    };

    const handleChangeSelectedDataTypeOther = async (event: any) => {
        uploaderContext!.setSelectedDataTypeOtherStatus("validating");
        let isValid = validateSelectedDataTypeOtherInput(event.target.value);
        if (isValid) {
            uploaderContext!.setSelectedDataTypeOtherStatus("success");
            uploaderContext!.setSelectedDataTypeValue(event.target.value);
        } else {
            let value = event.target.value;
            // Silently reset in case of empty string.
            if (value !== "") {
                value = uploaderContext!.selectedDataTypeValue;
            }
            uploaderContext!.setSelectedDataTypeOtherStatus("error");
            uploaderContext!.setSelectedDataTypeValue(value);
        }
    };

    return (
        <Layout>
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
                                {uploaderContext!.isLoadingProjectList &&
                                    <Content style={{ marginTop: "20px" }}>
                                        <div>Loading projects for {authContext!.username} ...</div>
                                        <Spin indicator={antIcon} />
                                    </Content>
                                }
                                {!(uploaderContext!.isLoadingProjectList) &&
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
                                            handleSelectProjectValue={handleSelectProjectValue}
                                            handleChangeSubjectLabel={handleChangeSubjectLabel}
                                            handleChangeSessionLabel={handleChangeSessionLabel}
                                            handleSelectDataTypeValue={handleSelectDataTypeValue}
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
                                                onClick={handleUpload}
                                            >
                                                Upload
                                    </Button>
                                        </Tooltip>
                                    )}
                            </Card>
                        </Col>
                    </Row>
                </div>
                <Footer />
                <Modal
                    title="Uploading"
                    visible={showUploadModal}
                    closable={false}
                    footer={[
                        <div key="buttons" style={{ height: "auto" }}>
                            <Row>
                                <Col span={24} style={{ textAlign: "right" }}>
                                    <Button type="primary" disabled={isUploading} onClick={(e) => {
                                        setShowUploadModal(false);

                                        // Keep projectList, projectNumber, subject, session, dataType, etc. but refresh the filelist
                                        uploaderContext!.setFileList([] as RcFile[]);
                                        uploaderContext!.setFileListSummary(0);
                                        uploaderContext!.setHasFilesSelected(false);
                                    }}>
                                        Upload another batch
                                    </Button>
                                    <Button disabled={isUploading} onClick={(e) => authContext!.signOut()}>
                                        Log out
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
                                    <Button onClick={(e) => {
                                        setShowFilesExistModal(false);
                                        setFilesExistMessage(<div></div>);
                                        setShowUploadModal(false);

                                        // Keep projectList, projectNumber, subject, session, dataType, etc. but refresh the filelist
                                        uploaderContext!.setFileList([] as RcFile[]);
                                        uploaderContext!.setFileListSummary(0);
                                        uploaderContext!.setHasFilesSelected(false);
                                    }}>Cancel
                                    </Button>
                                </Col>
                                <Col span={12} style={{ textAlign: "right" }}>
                                    <Button type="primary" onClick={(e) => {
                                        setShowFilesExistModal(false);
                                        setFilesExistMessage(<div></div>);
                                        handleRealUpload();
                                    }}>Ok
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
                    <div>Overwrite the following file(s)?</div>
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
                                    <Button type="primary" onClick={(e) => {
                                        setFailed(true);
                                        setShowErrorModal(false);
                                        setErrorMessage("");
                                    }}>Ok
                                    </Button>
                                </Col>
                            </Row>
                        </div>
                    ]}
                >
                    <div>{errorMessage}</div>
                </Modal>
            </Content>
        </Layout>
    );
};

export default Uploader;
