import React from "react";

import { Button, Tooltip } from "antd";

interface UploadButtonProps {
    enable: boolean;
    handleInitiateUpload: () => void;
}

interface EnabledUploadButtonProps {
    handleInitiateUpload: () => void;
}

const EnabledUploadButton: React.FC<EnabledUploadButtonProps> = ({ handleInitiateUpload }) => {
    return (

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
                onClick={() => { handleInitiateUpload(); }}
            >
                Upload
              </Button>
        </Tooltip>
    );
};

const DisabledUploadButton: React.FC = () => {
    return (
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
    );
};

const UploadButton: React.FC<UploadButtonProps> = ({ enable, handleInitiateUpload }) => {
    return (
        <React.Fragment>
            {
                enable && <EnabledUploadButton handleInitiateUpload={handleInitiateUpload} />
            }
            {
                !enable && <DisabledUploadButton />
            }
        </React.Fragment>
    );
};

export default UploadButton;