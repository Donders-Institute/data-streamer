import React, { useContext } from "react";

import {
    Row,
    Col,
    Button,
    Modal,
    Icon,
    Progress,
    message
} from "antd";

import LoadingIcon from "../../../../components/LoadingIcon/LoadingIcon";

import {
    UploadState,
    UploadStatus,
    ErrorState,
    ErrorType,
    AuthActionType,
    initialAuthState
} from "../../../../types/types";
import { signOut } from "../../../../services/auth/auth";
import { AuthContext } from "../../../../services/auth/authContext";

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

    const {state: authState, updateState: updateAuthState} = useContext(AuthContext);

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
                                onClick={() => {
                                    const aborter = new AbortController();
                                    signOut({
                                        username: authState.userProfile.username,
                                        password: authState.userProfile.password,
                                        signal: aborter.signal,
                                    }).then(_ => {
                                        console.log("logout successful");
                                    }).catch((err: Error) => {
                                        message.error({
                                            content: `logout failure: ${err.message}`
                                        });
                                    }).finally(() => {
                                        updateAuthState && updateAuthState({
                                            type: AuthActionType.NotSignedIn,
                                            payload: initialAuthState,
                                        });
                                        aborter.abort();
                                    });                                    
                                }}
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