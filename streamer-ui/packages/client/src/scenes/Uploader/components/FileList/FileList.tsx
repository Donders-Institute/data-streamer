import React from "react";

import {
    Icon,
    Button,
    Table,
    Tooltip
} from "antd";

import LoadingIcon from "../../../../components/LoadingIcon/LoadingIcon";
import { formatBytes } from "../../../../services/format/format";

import {
    RcFile,
    FilesSelection
} from "../../../../types/types";

interface FileListProps {
    filesSelection: FilesSelection;
    handleRemoveSelectedFile: (filename: string, uid: string, size: number) => void;
    handleResetFileList: () => void;
}

const FileList: React.FC<FileListProps> = ({
    filesSelection,
    handleRemoveSelectedFile,
    handleResetFileList
}) => {

    const fileList = filesSelection.fileList;
    const totalSizeBytes = filesSelection.totalSizeBytes;
    const hasFilesSelected = filesSelection.hasFilesSelected;

    const columnsFileList = [
        {
            title: "Selected Files",
            dataIndex: "name",
            key: "name",
            width: "70%",
            render: (text: string) => (
                <span style={{ color: "#52c41a" }}>{text}</span>
            )
        },
        {
            title: "Size",
            dataIndex: "size",
            key: "size",
            width: "20%",
            render: (text: string) => (
                <span style={{ color: "black" }}>{formatBytes(text)}</span>
            )
        },
        {
            title: "",
            key: "action",
            width: "10%",
            render: (file: RcFile) => (
                <span
                    style={{ float: "right" }}
                    onClick={() => {
                        handleRemoveSelectedFile(file.name, file.uid, file.size);
                    }}
                >
                    <Icon type="close" /> &nbsp;&nbsp;
                </span>
            )
        }
    ];

    const dataSummary = [
        {
            id: 1,
            name: "Total size",
            total: totalSizeBytes
        }
    ];

    const columnsSummary = [
        {
            title: "",
            dataIndex: "name",
            key: "name",
            width: "70%",
            render: (text: string) => (
                <span style={{ color: "black" }}>{text}</span>
            )
        },
        {
            title: "total size",
            dataIndex: "total",
            key: "total",
            width: "20%",
            render: (text: string) => (
                <span style={{ color: "black" }}>{formatBytes(text)}</span>
            )
        },
        {
            title: "clear all",
            key: "action",
            width: "10%",
            render: () => (
                <Button
                    style={{ float: "right" }}
                    type="link"
                    onClick={() => {
                        handleResetFileList();
                    }}
                >
                    Clear all
                </Button>
            )
        }
    ];

    return (
        <React.Fragment>
            <Tooltip placement="topLeft" title="Shows list of files to be uploaded">
                <Table
                    rowKey={(file: RcFile) => file.uid}
                    columns={columnsFileList}
                    dataSource={fileList}
                    pagination={false}
                    size={"small"}
                    scroll={{ y: 300 }}
                />
                {
                    hasFilesSelected &&
                    <Table
                        rowKey="total"
                        columns={columnsSummary}
                        dataSource={dataSummary}
                        pagination={false}
                        size={"small"}
                        showHeader={false}
                    />
                }
            </Tooltip>
        </React.Fragment>
    );
};

export default FileList;
