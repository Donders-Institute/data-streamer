import React from "react";

import {
    Row,
    Col,
    Button,
    Modal
} from "antd";

import ExistingFilesList from "../../components/ExistingFilesList/ExistingFilesList";
import TargetPath from "../../components/TargetPath/TargetPath";

import { UploadState } from "../../../../types/types";

interface ConfirmModalProps {
    uploadState: UploadState;
    showConfirmModal: boolean;
    handleOkConfirmModal: () => void;
    handleCancelConfirmModal: () => void;
    existingFiles: string[];
};

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    uploadState,
    showConfirmModal,
    handleOkConfirmModal,
    handleCancelConfirmModal,
    existingFiles
}) => {
    return (
        <Modal
            title="Warning"
            visible={showConfirmModal}
            closable={false}
            footer={[
                <div key="buttons" style={{ height: "auto" }}>
                    <Row>
                        <Col span={12} style={{ textAlign: "left" }}>
                            <Button onClick={() => { handleCancelConfirmModal(); }}>
                                Cancel
                    </Button>
                        </Col>
                        <Col span={12} style={{ textAlign: "right" }}>
                            <Button type="primary" onClick={() => { handleOkConfirmModal(); }}>
                                Ok
                    </Button>
                        </Col>
                    </Row>
                </div>
            ]}
            width={"80%"} style={{
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
            <TargetPath uploadState={uploadState} />
            <div style={{ marginTop: "20px" }}>
                <ExistingFilesList existingFiles={existingFiles} />
            </div>
        </Modal>
    );
};

export default ConfirmModal;
