import React from "react";

import {
    Icon,
    Button,
    Table,
    Tooltip
} from "antd";

import { formatBytes } from "../../../../services/format/format";
import { RcFile } from "../../../../types/types";

interface FileListProps {
    fileList: RcFile[];
    fileListSummary: number;
    hasFilesSelected: boolean;
    handleDelete: (uid: string, filename: string, size: number) => void;
    handleDeleteList: () => void;
}

const FileList: React.FC<FileListProps> = ({
    fileList,
    fileListSummary,
    hasFilesSelected,
    handleDelete,
    handleDeleteList
}) => {

    const dataSourceFileListSummary = [
        {
            id: 1,
            name: "Total size",
            total: fileListSummary
        }
    ];

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
            render: (text: string, record: RcFile) => (
                <span
                    style={{ float: "right" }}
                    onClick={() => {
                        handleDelete(record.uid, record.name, record.size);
                    }}
                >
                    <Icon type="close" /> &nbsp;&nbsp;
                </span>
            )
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
            render: (text: string, record: any) => (
                <Button
                    style={{ float: "right" }}
                    type="link"
                    onClick={() => {
                        handleDeleteList();
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
                    rowKey={(record: RcFile) => record.uid}
                    columns={columnsFileList}
                    dataSource={fileList}
                    pagination={false}
                    size={"small"}
                    scroll={{ y: 300 }}
                />
                {hasFilesSelected &&
                    <Table
                        rowKey="total"
                        columns={columnsSummary}
                        dataSource={dataSourceFileListSummary}
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
