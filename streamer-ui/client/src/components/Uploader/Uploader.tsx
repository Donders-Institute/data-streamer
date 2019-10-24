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
    Tooltip
} from "antd";
import axios, { AxiosError, AxiosResponse, AxiosRequestConfig } from "axios";

import { AuthContext } from "../Auth/AuthContext";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import FileSelector from "./FileSelector";
import FileList from "./FileList";
import TargetPath from "./TargetPath";
import StructureSelector from "./StructureSelector";
import { fetchDummyProjectList } from "./fetch";
import { RcFile, Project, SelectOption, ValidateStatuses } from "./types";
import { validateSubjectLabelInput, validateSessionLabelInput, validateSelectedDataTypeOtherInput } from "./utils";

const { Content } = Layout;

// 1 GB = 1024 * 1024 * 1024 bytes = 1073741824 bytes
const maxSizeLimitBytes = 1073741824;
const maxSizeLimitAsString = "1 GB";

// 5 minutes = 5 * 60 * 1000 ms = 300000 ms
const uploadTimeout = 300000;

const Uploader: React.FC = () => {
    const authContext = useContext(AuthContext);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [uploadingPercentage, setUploadingPercentage] = useState(0);
    const [totalSizeBytes, setTotalSizeBytes] = useState(0);
    const [remainingItems, setRemainingItems] = useState(0);
    const [isUploading, setIsUploading] = useState(true);
    const [failed, setFailed] = useState(false);
    const [isLoadingProjectList, setIsLoadingProjectList] = useState(true);
    const [projectList, setProjectList] = useState([] as Project[]);
    const [selectedProjectStatus, setSelectedProjectStatus] = useState("" as (typeof ValidateStatuses)[number]);
    const [selectedSubjectStatus, setSelectedSubjectStatus] = useState("" as (typeof ValidateStatuses)[number]);
    const [selectedSessionStatus, setSelectedSessionStatus] = useState("" as (typeof ValidateStatuses)[number]);
    const [selectedDataTypeStatus, setSelectedDataTypeStatus] = useState("" as (typeof ValidateStatuses)[number]);
    const [selectedDataTypeOtherStatus, setSelectedDataTypeOtherStatus] = useState("" as (typeof ValidateStatuses)[number]);
    const [selectedProjectValue, setSelectedProjectValue] = useState("");
    const [selectedSubjectValue, setSelectedSubjectValue] = useState("");
    const [selectedSessionValue, setSelectedSessionValue] = useState("");
    const [selectedDataTypeValue, setSelectedDataTypeValue] = useState("");
    const [isSelectedProject, setIsSelectedProject] = useState(false);
    const [isSelectedSubject, setIsSelectedSubject] = useState(false);
    const [isSelectedSession, setIsSelectedSession] = useState(false);
    const [isSelectedDataType, setIsSelectedDataType] = useState(false);
    const [isSelectedDataTypeOther, setIsSelectedDataTypeOther] = useState(false);
    const [fileList, setFileList] = useState([] as RcFile[]);
    const [fileListSummary, setFileListSummary] = useState(0);
    const [hasFilesSelected, setHasFilesSelected] = useState(false);
    const [proceed, setProceed] = useState(false);
    const antIcon = <Icon type="loading" style={{ fontSize: 24, margin: 10 }} spin />;

    useEffect(() => {
        const fetchData = async (username: string, password: string) => {
            setIsLoadingProjectList(true);
            const data = await fetchDummyProjectList(username, password);
            setProjectList(data);
            setIsLoadingProjectList(false);
        };
        fetchData(authContext!.username, authContext!.password);
    }, [authContext]);

    const handleUploadResponse = (response: AxiosResponse) => {
        // console.log(response.data);
        // console.log(response.status);
        // console.log(response.statusText);
        // console.log(response.headers);
        // console.log(response.config);
        return response;
    };

    const handleUploadError = (error: AxiosError) => {
        var newErrorMessage = "could not connect to data streamer UI server";
        if (error.response) {
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
            if (error.response.data) {
                newErrorMessage = JSON.stringify(error.response.data, null, 2);
            }
        } else {
            console.log(error.message);
            newErrorMessage = error.message;
        }
        console.log(newErrorMessage);
        setErrorMessage(errorMessage => newErrorMessage);
        setShowErrorModal(true);
        setFailed(true);
        setIsUploading(false);
        return error;
    };

    const handleUploadRequest = (username: string, password: string, formData: any, fileSizeBytes: number) => {
        let promise = new Promise((resolve, reject) => {
            const config: AxiosRequestConfig = {
                url: "/upload",
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
                .then(handleUploadResponse)
                .then(function (response: AxiosResponse) {
                    let value = uploadingPercentage + Math.floor(100.0 * fileSizeBytes / totalSizeBytes);
                    setUploadingPercentage(uploadingPercentage => value);
                    setRemainingItems(remainingItems => remainingItems - 1);
                    return value;
                })
                .catch(handleUploadError));
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

    const handleDummyUploadRequest = (username: string, password: string, formData: any, fileSizeBytes: number) => {
        let promise = new Promise((resolve, reject) => {
            const config: AxiosRequestConfig = {
                url: "/upload",
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
                .then(handleUploadResponse)
                .then(function (response: AxiosResponse) {
                    let value = uploadingPercentage + Math.floor(100.0 * fileSizeBytes / totalSizeBytes);
                    setUploadingPercentage(uploadingPercentage => value);
                    setRemainingItems(remainingItems => remainingItems - 1);
                    return value;
                })
                .catch(handleUploadError));
        });
        return promise;
    };

    const handleUpload = (event: any) => {
        setFailed(false);
        setRemainingItems(remainingItems => fileList.length);
        setUploadingPercentage(uploadingPercentage => 0);
        setIsUploading(true);
        setShowUploadModal(true);

        let newTotalSizeBytes = 0;
        let work = [] as Promise<unknown>[];
        fileList.forEach((file: any) => {
            var formData = new FormData();

            // Add the attributes
            formData.append("projectNumber", selectedProjectValue);
            formData.append("subjectLabel", selectedSubjectValue);
            formData.append("sessionLabel", selectedSessionValue);
            formData.append("dataType", selectedDataTypeValue);

            formData.append("ipAddress", authContext!.ipAddress);
            formData.append("filename", file.name);
            formData.append("filesize", file.size);
            formData.append("uid", file.uid);

            newTotalSizeBytes += file.size;

            // Add one file
            formData.append("files", file);

            const p = handleUploadRequest(authContext!.username, authContext!.password, formData, file.size);
            // const p = handleDummyUploadRequest(authContext!.username, authContext!.password, formData, file.size);
            work.push(p.catch(error => {
                setFailed(true);
                setIsUploading(false);
                console.log(error);
            }));
        });

        setTotalSizeBytes(totalSizeBytes => newTotalSizeBytes);

        Promise.all(work)
            .then(function (results) {
                setRemainingItems(remainingItems => 0);
                setUploadingPercentage(uploadingPercentage => 100);
                setTotalSizeBytes(totalSizeBytes => 0);
                setIsUploading(false);
                setFailed(false);
                console.log(results);
            });
    };

    const handleDelete = (uid: string, filename: string, size: number) => {
        const fileListUpdated = fileList.filter(
            (item: any) => item.name !== filename && item.uid !== uid
        );
        const hasFilesSelectedUpdated = fileListUpdated.length > 0;
        setHasFilesSelected(hasFilesSelectedUpdated);
        setFileList(fileListUpdated);
        setFileListSummary(fileListSummary => fileListSummary - size);
    };

    const handleDeleteList = () => {
        setHasFilesSelected(false);
        setFileList([] as RcFile[]);
        setFileListSummary(0);
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

    const handleBeforeUpload = (file: RcFile, batch: RcFile[]) => {
        let isValidBatch = true;
        let maxFileSizeExceeded = false;
        let largeFiles = [] as string[];
        let duplicates = [] as string[];
        // TODO: Find a way to do this check only once (i.e. per batch)
        for (let i = 0; i < batch.length; i++) {
            if (file.size >= maxSizeLimitBytes) {
                largeFiles.push(batch[i].name);
                maxFileSizeExceeded = true;
                isValidBatch = false;
            }
            if (fileNameExists(batch[i], fileList)) {
                duplicates.push(batch[i].name);
                isValidBatch = false;
            }
        }
        if (isValidBatch) {
            setHasFilesSelected(true);
            setFileList(fileList => [...fileList, file]);
            setFileListSummary(fileListSummary => fileListSummary + file.size);
        } else {
            setFileList(fileList => [...fileList]);
            setHasFilesSelected(fileList.length > 0);
            setFileListSummary(fileListSummary => fileListSummary);
            let msg = "";
            if (duplicates.length === 1) {
                msg = `Filename already exists, please rename: "${duplicates[0]}"`;
            } else {
                msg = `Filenames already exist, please rename: [${duplicates.join(", ")}]`;
            }
            if (duplicates.length === 0 && maxFileSizeExceeded) {
                if (largeFiles.length === 1) {
                    msg = `Maximum file size exceeded (file size must be less than ${maxSizeLimitAsString} for a single file): "${largeFiles[0]}"`;
                } else {
                    msg = `Maximum file size exceeded (file size must be less than ${maxSizeLimitAsString} for a single file): [${largeFiles.join(", ")}]`;
                }
            }
            setErrorMessage(msg);
            setShowErrorModal(true);
        }
        return true; // bypass default behaviour
    };

    const handleSelectProjectValue = (value: SelectOption) => {
        setSelectedProjectStatus("success");
        setSelectedProjectValue(value.key);
        setIsSelectedProject(true);
        setSelectedSubjectValue("");
        setIsSelectedSubject(false);
        setSelectedSessionValue("");
        setIsSelectedSession(false);
        setSelectedDataTypeValue("");
        setIsSelectedDataType(false);
        setIsSelectedDataTypeOther(false);
        setProceed(false);
    };

    const handleChangeSubjectLabel = (event: any) => {
        setSelectedSubjectStatus("validating");
        let isValid = validateSubjectLabelInput(event.target.value);
        if (isValid) {
            setSelectedSubjectStatus("success");
            setSelectedSubjectValue(event.target.value);
            setIsSelectedSubject(true);
            setSelectedSessionValue("");
            setIsSelectedSession(false);
            setSelectedDataTypeValue("");
            setIsSelectedDataType(false);
            setIsSelectedDataTypeOther(false);
            setProceed(false);
        } else {
            let value = event.target.value;
            // Do not store invalid strings.
            // Silently reset in case of empty string.
            if (value !== "") {
                value = selectedSubjectValue;
            }
            setSelectedSubjectStatus("error");
            setSelectedSubjectValue(value);
            setIsSelectedSubject(false);
            setSelectedSessionValue("");
            setIsSelectedSession(false);
            setSelectedDataTypeValue("");
            setIsSelectedDataType(false);
            setIsSelectedDataTypeOther(false);
            setProceed(false);
        }
    };

    const handleChangeSessionLabel = (event: any) => {
        setSelectedSessionStatus("validating");
        let isValid = validateSessionLabelInput(event.target.value);
        if (isValid) {
            setSelectedSessionStatus("success");
            setSelectedSessionValue(event.target.value);
            setIsSelectedSession(true);
            setSelectedDataTypeValue("");
            setIsSelectedDataType(false);
            setIsSelectedDataTypeOther(false);
            setProceed(false);
        } else {
            let value = event.target.value;
            // Do not store invalid strings.
            // Silently reset in case of empty string.
            if (value !== "") {
                value = selectedSessionValue;
            }
            setSelectedSessionStatus("error");
            setSelectedSessionValue(value);
            setIsSelectedSession(false);
            setSelectedDataTypeValue("");
            setIsSelectedDataType(false);
            setIsSelectedDataTypeOther(false);
            setProceed(false);
        }
    };

    const handleSelectDataTypeValue = (value: SelectOption) => {
        setSelectedDataTypeStatus("success");
        setSelectedDataTypeValue(value.key);
        setIsSelectedDataType(true);
        setSelectedDataTypeOtherStatus("");
        setIsSelectedDataTypeOther(false);
        let proceed = true;
        if (value.key === "other") {
            setIsSelectedDataTypeOther(true);
            proceed = false;
        }
        setProceed(proceed);
    };

    const handleChangeSelectedDataTypeOther = (event: any) => {
        setSelectedDataTypeOtherStatus("validating");
        let isValid = validateSelectedDataTypeOtherInput(event.target.value);
        if (isValid) {
            setSelectedDataTypeOtherStatus("success");
            setSelectedDataTypeValue(event.target.value);
            setProceed(true);
        } else {
            let value = event.target.value;
            // Do not store invalid strings.
            // Silently reset in case of empty string.
            if (value !== "") {
                value = selectedDataTypeValue;
            }
            setSelectedDataTypeOtherStatus("error");
            setSelectedDataTypeValue(value);
            setProceed(false);
        }
    };

    return (
        <Content style={{ background: "#f0f2f5" }}>
            <Header />
            <div style={{ padding: 10 }}>
                <Row>
                    <Col span={12}>
                        <Card
                            style={{
                                borderRadius: 4,
                                boxShadow: "1px 1px 1px #ddd",
                                minHeight: "700px",
                                height: "100%",
                                marginTop: 10
                            }}
                            className="shadow"
                        >
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
                        <Card
                            style={{
                                marginLeft: 10,
                                borderRadius: 4,
                                boxShadow: "1px 1px 1px #ddd",
                                minHeight: "700px",
                                marginTop: 10
                            }}
                            className="shadow"
                        >
                            <table style={{ width: "100%" }}>
                                <tr>
                                    <td>
                                        <Tooltip placement="bottomLeft" title="Set destination folder settings below. 1) Select project, 2) set subject label, 3) set session label, and 4) set data type"><h2>Project storage</h2></Tooltip>
                                    </td>
                                    <td style={{ float: "right" }}>
                                        <TargetPath
                                            isSelectedProject={isSelectedProject}
                                            projectNumber={selectedProjectValue}
                                            isSelectedSubject={isSelectedSubject}
                                            subjectLabel={selectedSubjectValue}
                                            isSelectedSession={isSelectedSession}
                                            sessionLabel={selectedSessionValue}
                                            isSelectedDataType={isSelectedDataType}
                                            dataType={selectedDataTypeValue}
                                        />
                                    </td>
                                </tr>
                            </table>
                            {isLoadingProjectList &&
                                <Content style={{ marginTop: "10px" }}>
                                    <div>Loading projects for {authContext!.username} ...</div>
                                    <Spin indicator={antIcon} />
                                </Content>
                            }
                            {!isLoadingProjectList &&
                                <StructureSelector
                                    projectList={projectList}
                                    selectedProjectStatus={selectedProjectStatus}
                                    selectedSubjectStatus={selectedSubjectStatus}
                                    selectedSessionStatus={selectedSessionStatus}
                                    selectedDataTypeStatus={selectedDataTypeStatus}
                                    selectedDataTypeOtherStatus={selectedDataTypeOtherStatus}
                                    isSelectedProject={isSelectedProject}
                                    projectNumber={selectedProjectValue}
                                    isSelectedSubject={isSelectedSubject}
                                    subjectLabel={selectedSubjectValue}
                                    isSelectedSession={isSelectedSession}
                                    sessionLabel={selectedSessionValue}
                                    isSelectedDataType={isSelectedDataType}
                                    isSelectedDataTypeOther={isSelectedDataTypeOther}
                                    dataType={selectedDataTypeValue}
                                    handleSelectProjectValue={handleSelectProjectValue}
                                    handleChangeSubjectLabel={handleChangeSubjectLabel}
                                    handleChangeSessionLabel={handleChangeSessionLabel}
                                    handleSelectDataTypeValue={handleSelectDataTypeValue}
                                    handleChangeSelectedDataTypeOther={handleChangeSelectedDataTypeOther}
                                />
                            }
                            {(!hasFilesSelected || !proceed) && (
                                <Tooltip placement="bottomRight" title="Please select one or more files and set the destination folder settings above. When 1) all source files are selected, and 2) the destination settings above are filled in properly, the button becomes green and clickable.">
                                    <Button
                                        disabled={true}
                                        size="large"
                                        style={{ width: "200px", float: "right" }}
                                    >
                                        Upload
                                    </Button>
                                </Tooltip>
                            )}
                            {isSelectedSession && hasFilesSelected && proceed && (
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
                    <Button type="primary" disabled={isUploading} onClick={(e) => {
                        setShowUploadModal(false);

                        // Keep projectList, projectNumber, subject, session, dataType, etc. but refresh the filelist
                        setFileList([] as RcFile[]);
                        setFileListSummary(0);
                        setHasFilesSelected(false);
                    }}>
                        Upload another batch
                    </Button>,
                    <Button disabled={isUploading} onClick={(e) => authContext!.signout()}>
                        Log out
                    </Button>
                ]}
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
                title="Error"
                visible={showErrorModal}
                closable={false}
                footer={[
                    <Button type="primary" onClick={(e) => {
                        setFailed(true);
                        setShowErrorModal(false);
                        setErrorMessage("");
                    }}>Ok
                    </Button>
                ]}
            >
                <div>{errorMessage}</div>
            </Modal>
        </Content >
    );
};

export default Uploader;
