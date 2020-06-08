import React from "react";

import {
    Row,
    Col,
    Button,
    Modal
} from "antd";

import { ErrorState } from "../../../../types/types";

interface ErrorModalProps {
    errorState: ErrorState;
    showErrorModal: boolean;
    handleOkErrorModal: () => void;
}

const ErrorModal: React.FC<ErrorModalProps> = ({
    errorState,
    showErrorModal,
    handleOkErrorModal
}) => {
    const errorMessage = errorState.errorMessage;

    return (
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
    );
};

export default ErrorModal;
