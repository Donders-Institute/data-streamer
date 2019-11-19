import React from "react";
import { Icon, Upload, Tooltip } from "antd";

import { RcFile } from "./types";

const { Dragger } = Upload;

interface IProps {
    fileList: RcFile[];
    fileListSummary: number;
    hasFilesSelected: boolean;
    handleBeforeUpload: (file: RcFile, fileList: RcFile[]) => boolean | PromiseLike<void>;
}

const FileSelector: React.FC<IProps> = ({ handleBeforeUpload }) => {

    return (
        <div>
            <Tooltip placement="topLeft" title="Select source files to be uploaded">
                <h2>Select files to be uploaded</h2>
                <Dragger
                    className="file-uploader"
                    name="file"
                    multiple={true}
                    beforeUpload={handleBeforeUpload}
                    showUploadList={false}
                    directory={false}
                >
                    <p className="ant-upload-drag-icon">
                        <Icon type="inbox" />
                    </p>
                    <p className="ant-upload-text">
                        Click or drag files to this area
                    </p>
                    <p className="ant-upload-hint">Select one or more files.</p>
                </Dragger>
            </Tooltip>
        </div >
    );
};

export default FileSelector;
