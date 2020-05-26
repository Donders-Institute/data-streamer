import React from "react";

import { List } from "antd";

interface ExistingFilesListProps {
    existingFiles: string[];
}

const ExistingFilesList: React.FC<ExistingFilesListProps> = ({ existingFiles }) => {
    return (
        <List
            size="small"
            dataSource={existingFiles}
            renderItem={(existingFile: string) => <List.Item>{existingFile}</List.Item>}
        />
    );
};

export default ExistingFilesList;
