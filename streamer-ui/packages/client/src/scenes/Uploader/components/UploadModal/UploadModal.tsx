import React from "react";

import {
    Row,
    Col,
    Button,
    Modal,
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
};

const UploadModal: React.FC<UploadModalProps> = ({
    uploadState,
    errorState,
    showUploadModal,
    handleUploadAnotherBatch
}) => {
    const hasUploadError = (
        errorState.errorType === ErrorType.ErrorInitiateUpload ||
        errorState.errorType === ErrorType.ErrorValidateUpload ||
        errorState.errorType === ErrorType.ErrorConfirmUpload ||
        errorState.errorType === ErrorType.ErrorUpload ||
        errorState.errorType === ErrorType.ErrorFinalizeUpload ||
        errorState.errorType === ErrorType.ErrorSubmit ||
        errorState.errorType === ErrorType.ErrorFinish ||
        errorState.errorType === ErrorType.ErrorUnknown
    );

    const isInitiating = uploadState.status === UploadStatus.Initiating;
    const isValidating = uploadState.status === UploadStatus.Validating;
    const isConfirming = uploadState.status === UploadStatus.Confirming;
    const isUploading = uploadState.status === UploadStatus.Uploading;
    const isFinalizing = uploadState.status === UploadStatus.Finalizing;
    const isSubmitting = uploadState.status === UploadStatus.Submitting;
    const isDone = uploadState.status === UploadStatus.Success || hasUploadError;

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
        }
    };
    const title = getTitle(uploadState.status);

    const numRemainingFiles = uploadState.numRemainingFiles;
    const percentage = uploadState.percentage;

    // Enable buttons when done    
    const disableButtons = isDone ? false : true;

    const getDoneMessage = (uploadStatus: UploadStatus, hasUploadError: boolean) => {
        if (hasUploadError) {
            return "Upload failed.";
        }
        if (uploadStatus === UploadStatus.Success) {
            return "Done. Streamer job submitted.";
        }
        return "";
    };
    const doneMessage = getDoneMessage(uploadState.status, hasUploadError);

    return (
        <Modal
            title={title}
            visible={showUploadModal}
            closable={false}
            footer={[
                <div key="buttons" style={{ height: "auto" }}>
                    <Row>
                        <Col span={24} style={{ textAlign: "right" }}>
                            <Button.Group>
                                <Button
                                    icon="upload"
                                    type="primary"
                                    disabled={disableButtons}
                                    onClick={() => { handleUploadAnotherBatch(); }}>
                                    Upload another batch
                                </Button>
                                <Button href="/oidc/logout" icon="logout" disabled={disableButtons}>
                                    Sign out
                                </Button>
                            </Button.Group>
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
                isInitiating && !hasUploadError && (
                    <div>
                        <div>Initiating upload ...</div>
                        <p>This may take a while ...</p>
                        <p style={{ fontWeight: "bold" }}>Do not close the browser</p>
                        <LoadingIcon />
                    </div>
                )
            }
            {
                isValidating && !hasUploadError && (
                    <div>
                        <div>Validating upload ...</div>
                        <p>This may take a while ...</p>
                        <p style={{ fontWeight: "bold" }}>Do not close the browser</p>
                        <LoadingIcon />
                    </div>
                )
            }
            {
                isConfirming && !hasUploadError && (
                    <div>
                        <div>Validating upload ...</div>
                        <p>This may take a while ...</p>
                        <p style={{ fontWeight: "bold" }}>Do not close the browser</p>
                    </div>
                )
            }
            {
                isUploading && !hasUploadError && (
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
                isFinalizing && !hasUploadError && (
                    <div>
                        <div>Finalizing upload ...</div>
                        <p>This may take a while ...</p>
                        <p style={{ fontWeight: "bold" }}>Do not close the browser</p>
                        <LoadingIcon />
                    </div>
                )
            }
            {
                isSubmitting && !hasUploadError && (
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