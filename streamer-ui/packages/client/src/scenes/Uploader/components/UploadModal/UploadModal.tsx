import React from "react";

import {
    Row,
    Col,
    Button,
    Modal,
    Icon,
    Progress
} from "antd";

import LoadingIcon from "../../../../components/LoadingIcon/LoadingIcon";

import {
    UploadState,
    UploadStatus,
    ErrorState,
    ErrorType
} from "../../../../types/types";

interface UploadModalProps {
    uploadState: UploadState;
    errorState: ErrorState;
    showUploadModal: boolean;
    handleUploadAnotherBatch: () => void;
    handleSignOut: () => Promise<void>;
};

const UploadModal: React.FC<UploadModalProps> = ({
    uploadState,
    errorState,
    showUploadModal,
    handleUploadAnotherBatch,
    handleSignOut
}) => {

    const isInitiating = uploadState.status === UploadStatus.Initiating;
    const isValidating = uploadState.status === UploadStatus.Validating;
    const isConfirming = uploadState.status === UploadStatus.Confirming;
    const isUploading = uploadState.status === UploadStatus.Uploading;
    const isFinalizing = uploadState.status === UploadStatus.Finalizing;
    const isSubmitting = uploadState.status === UploadStatus.Submitting;
    const isDone = uploadState.status === UploadStatus.Success || uploadState.status === UploadStatus.Error;

    const hasError = (
        errorState.errorType === ErrorType.ErrorInitiateUpload ||
        errorState.errorType === ErrorType.ErrorValidateUpload ||
        errorState.errorType === ErrorType.ErrorUpload ||
        errorState.errorType === ErrorType.ErrorFinalizeUpload ||
        errorState.errorType === ErrorType.ErrorSubmit ||
        errorState.errorType === ErrorType.ErrorFinish ||
        (errorState.errorType !== ErrorType.ErrorSelectUpload &&
            errorState.errorType !== ErrorType.NoError &&
            uploadState.status === UploadStatus.Error)
    );

    const getTitle = (uploadStatus: UploadStatus) => {
        switch (uploadStatus) {
            case UploadStatus.Initiating:
                return "Initiating upload";
            case UploadStatus.Validating:
                return "Validating upload";
            case UploadStatus.Confirming:
                return "Validating upload";
            case UploadStatus.Uploading:
                return "Uploading";
            case UploadStatus.Finalizing:
                return "Finalizing upload";
            case UploadStatus.Submitting:
                return "Submitting streamer job";
            case UploadStatus.Success:
                return "Upload summary";
            case UploadStatus.Error:
                return "Upload error";
        }
    };
    const title = getTitle(uploadState.status);

    const numRemainingFiles = uploadState.numRemainingFiles;
    const percentage = uploadState.percentage;

    const getDisableButtons = (uploadStatus: UploadStatus) => {
        if (uploadStatus === UploadStatus.Success ||
            uploadStatus === UploadStatus.Error) {
            // Enable buttons when done    
            return false;
        }
        return true;
    };
    const disableButtons = getDisableButtons(uploadState.status);

    const getDoneMessage = (uploadStatus: UploadStatus) => {
        if (uploadStatus === UploadStatus.Success) {
            return "Done. Streamer job submitted.";
        }
        if (uploadStatus === UploadStatus.Error) {
            return "Upload failed.";
        }
        return "";
    };
    const doneMessage = getDoneMessage(uploadState.status);

    return (
        <Modal
            title={title}
            visible={showUploadModal}
            closable={false}
            footer={[
                <div key="buttons" style={{ height: "auto" }}>
                    <Row>
                        <Col span={24} style={{ textAlign: "right" }}>
                            <Button
                                type="primary"
                                disabled={disableButtons}
                                onClick={() => { handleUploadAnotherBatch(); }}
                            >
                                Upload another batch
                            </Button>
                            <Button
                                disabled={disableButtons}
                                onClick={() => { handleSignOut(); }}
                            >
                                <Icon type="logout" /> Sign out
                            </Button>
                        </Col>
                    </Row>
                </div >
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
                isInitiating && !hasError && (
                    <div>
                        <div>Initiating upload ...</div>
                        <p>This may take a while ...</p>
                        <p style={{ fontWeight: "bold" }}>Do not close the browser</p>
                        <LoadingIcon />
                    </div>
                )
            }
            {
                isValidating && !hasError && (
                    <div>
                        <div>Validating upload ...</div>
                        <p>This may take a while ...</p>
                        <p style={{ fontWeight: "bold" }}>Do not close the browser</p>
                        <LoadingIcon />
                    </div>
                )
            }
            {
                isConfirming && !hasError && (
                    <div>
                        <div>Validating upload ...</div>
                        <p>This may take a while ...</p>
                        <p style={{ fontWeight: "bold" }}>Do not close the browser</p>
                    </div>
                )
            }
            {
                isUploading && !hasError && (
                    <div>
                        <Progress percent={percentage} />
                        <div>Uploading ...</div>
                        <div>Item(s) remaining: {numRemainingFiles}</div>
                        <p>This may take a while ...</p>
                        <p style={{ fontWeight: "bold" }}>Do not close the browser</p>
                        <LoadingIcon />
                    </div>
                )
            }
            {
                isFinalizing && !hasError && (
                    <div>
                        <div>Finalizing upload ...</div>
                        <p>This may take a while ...</p>
                        <p style={{ fontWeight: "bold" }}>Do not close the browser</p>
                        <LoadingIcon />
                    </div>
                )
            }
            {
                isSubmitting && !hasError && (
                    <div>
                        <div>Submitting streamer job ...</div>
                        <p>This may take a while ...</p>
                        <p style={{ fontWeight: "bold" }}>Do not close the browser</p>
                        <LoadingIcon />
                    </div>
                )
            }
            {
                isDone && (
                    <div>
                        <p>{doneMessage}</p>
                    </div>
                )
            }
        </Modal >
    );
};

export default UploadModal;