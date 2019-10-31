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
import { UploaderContext } from "./UploaderContext";

import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import FileSelector from "./FileSelector";
import FileList from "./FileList";
import TargetPath from "./TargetPath";
import StructureSelector from "./StructureSelector";
import { RcFile, SelectOption } from "./types";
import { validateSubjectLabelInput, validateSessionLabelInput, validateSelectedDataTypeOtherInput } from "./utils";
import { fetchProjectList } from "./fetch";

const { Content } = Layout;

// 1 GB = 1024 * 1024 * 1024 bytes = 1073741824 bytes
const maxSizeLimitBytes = 1073741824;
const maxSizeLimitAsString = "1 GB";

// 5 minutes = 5 * 60 * 1000 ms = 300000 ms
const uploadTimeout = 300000;

const Uploader: React.FC = () => {
    const authContext = useContext(AuthContext);
    const uploaderContext = useContext(UploaderContext);

    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [uploadingPercentage, setUploadingPercentage] = useState(0);
    const [totalSizeBytes, setTotalSizeBytes] = useState(0);
    const [remainingItems, setRemainingItems] = useState(0);
    const [isUploading, setIsUploading] = useState(true);
    const [failed, setFailed] = useState(false);
    const [proceed, setProceed] = useState(false);

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
                    let value = totalSizeBytes > 0 ? uploadingPercentage + Math.floor(100.0 * fileSizeBytes / totalSizeBytes) : 100;
                    setUploadingPercentage(uploadingPercentage => value);
                    setRemainingItems(remainingItems => remainingItems - 1);
                    return value;
                })
                .catch(handleUploadError));
        });
        return promise;
    };

    // function dummyAxiosRequest<T = any, R = AxiosResponse<T>>(config: AxiosRequestConfig): Promise<R> {
    //     const promise = new Promise<R>(function (resolve, reject) {
    //         setTimeout(function () {
    //             let response = {
    //                 data: { test: "test" },
    //                 status: 200,
    //                 statusText: "OK",
    //                 headers: {},
    //                 config: config
    //             } as unknown as (R | PromiseLike<R> | undefined);
    //             resolve(response);
    //         }, 2000);
    //     });
    //     return promise;
    // }

    // const handleDummyUploadRequest = (username: string, password: string, formData: any, fileSizeBytes: number) => {
    //     let promise = new Promise((resolve, reject) => {
    //         const config: AxiosRequestConfig = {
    //             url: "/upload",
    //             method: "post",
    //             headers: { "Content-Type": "multipart/form-data" },
    //             data: formData,
    //             timeout: uploadTimeout,
    //             withCredentials: true,
    //             auth: {
    //                 username: username,
    //                 password: password
    //             },
    //             responseType: "json"
    //         };

    //         resolve(dummyAxiosRequest(config)
    //             .then(handleUploadResponse)
    //             .then(function (response: AxiosResponse) {
    //                 let value = totalSizeBytes > 0 ? uploadingPercentage + Math.floor(100.0 * fileSizeBytes / totalSizeBytes) : 100;
    //                 setUploadingPercentage(uploadingPercentage => value);
    //                 setRemainingItems(remainingItems => remainingItems - 1);
    //                 return value;
    //             })
    //             .catch(handleUploadError));
    //     });
    //     return promise;
    // };

    const handleUpload = (event: any) => {
        setFailed(false);
        setRemainingItems(remainingItems => uploaderContext!.fileList.length);
        setUploadingPercentage(uploadingPercentage => 0);
        setIsUploading(true);
        setShowUploadModal(true);

        let newTotalSizeBytes = 0;
        let work = [] as Promise<unknown>[];
        uploaderContext!.fileList.forEach((file: any) => {
            var formData = new FormData();

            // Add the attributes
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

            // To be removed
            console.log("fileName: " + file.name);
            console.log("fileSize: " + file.size);
            console.log("fileType: " + file.type);
            console.log("file uid: " + file.uid);

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

    // TODO: Find a way to detect directories
    const isDirectory = (file: RcFile) => {
        return false;
    };

    const handleBeforeUpload = (file: RcFile, batch: RcFile[]) => {
        let isValidBatch = true;
        let maxFileSizeExceeded = false;
        let directories = [] as string[];
        let largeFiles = [] as string[];
        let duplicates = [] as string[];
        // TODO: Find a way to do this check only once (i.e. per batch)
        for (let i = 0; i < batch.length; i++) {
            // Make sure that the file is not a directory
            if (isDirectory(file)) {
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
            uploaderContext!.setFileList([...(uploaderContext!.fileList), file]);
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
                    msg = `Filename already exists, please rename: "${duplicates[0]}"`;
                } else {
                    msg = `Filenames already exist, please rename: [${duplicates.join(", ")}]`;
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
        return true; // bypass default behaviour
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
                                            isSelectedProject={uploaderContext!.isSelectedProject}
                                            projectNumber={uploaderContext!.selectedProjectValue}
                                            subjectLabel={uploaderContext!.selectedSubjectValue}
                                            sessionLabel={uploaderContext!.selectedSessionValue}
                                            isSelectedDataType={uploaderContext!.isSelectedDataType}
                                            dataType={uploaderContext!.selectedDataTypeValue}
                                        />
                                    </td>
                                </tr>
                            </table>
                            {uploaderContext!.isLoadingProjectList &&
                                <Content style={{ marginTop: "10px" }}>
                                    <div>Loading projects for {authContext!.username} ...</div>
                                    <Spin indicator={antIcon} />
                                </Content>
                            }
                            {!(uploaderContext!.isLoadingProjectList) &&
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
                            }
                            {(!(uploaderContext!.hasFilesSelected) || !proceed) && (
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
                            {uploaderContext!.isSelectedSession && uploaderContext!.hasFilesSelected && proceed && (
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
                        uploaderContext!.setFileList([] as RcFile[]);
                        uploaderContext!.setFileListSummary(0);
                        uploaderContext!.setHasFilesSelected(false);
                    }}>
                        Upload another batch
                    </Button>,
                    <Button disabled={isUploading} onClick={(e) => authContext!.signOut()}>
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
