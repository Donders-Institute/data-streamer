import React from 'react';
import { Select, Form, Row, Col, Upload, Layout, Card, Icon, Button, Table, notification, Input, Tooltip } from 'antd';
import { FormComponentProps } from "antd/lib/form";

const { Content } = Layout;
const { Option } = Select;

const { Dragger } = Upload;

interface IProps {
    title?: string | undefined;
}

interface RcFile extends File {
    uid: string;
    readonly lastModifiedDate: Date;
    readonly webkitRelativePath: string;
}

type UploaderAppState = {
    selectedProjectValue: string,
    selectedSubjectValue: string,
    selectedDataTypeValue: string,
    selectedSessionValue: string,
    isSelectedProject: boolean,
    isSelectedSubject: boolean,
    isSelectedSession: boolean,
    isSelectedDataType: boolean,
    isSelectedDataTypeOther: boolean,
    doneWithSelectDataType: boolean,
    fileList: RcFile[], // Antd's internal file list
    fileListClean: RcFile[], // The file list we use
    hasFilesSelected: boolean,
    proceed: boolean,
}

type SelectOption = {
    key: string
}

const dataSourceProjects = [
    {
        "project_number": "12345678.01",
        "list_experiments": [
            {
                "id": 0,
                "experiment_name": "",
                "experiment_type": "MRI",
                "duration": "02:00",
                "list_subjects": [
                    {
                        "id": 1,
                        "subject": "1",
                        "list_sessions": [
                            { "id": 1, "session": "1" },
                            { "id": 2, "session": "2" }
                        ]
                    },
                    {
                        "id": 2,
                        "subject": "2",
                        "list_sessions": [
                            { "id": 1, "session": "1" },
                            { "id": 2, "session": "2" }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "project_number": "12345678.02",
        "list_experiments": [
            {
                "id": 0,
                "experiment_name": "",
                "experiment_type": "MRI",
                "duration": "02:00",
                "list_subjects": [
                    {
                        "id": 1,
                        "subject": "1",
                        "list_sessions": [
                            { "id": 1, "session": "1" },
                            { "id": 2, "session": "2" }
                        ]
                    },
                    {
                        "id": 2,
                        "subject": "2",
                        "list_sessions": [
                            { "id": 1, "session": "1" },
                            { "id": 2, "session": "2" }
                        ]
                    }
                ]
            }
        ]
    }
];

const dataSourceDataTypes = [
    {
        "id": 1,
        "data_type": "mri"
    },
    {
        "id": 2,
        "data_type": "meg"
    },
    {
        "id": 3,
        "data_type": "eeg"
    },
    {
        "id": 4,
        "data_type": "ieee"
    },
    {
        "id": 5,
        "data_type": "beh"
    },
    {
        "id": 6,
        "data_type": "other"
    }
];

const initialProjectValue: string = dataSourceProjects[0]['project_number'];
const initialDataTypeValue: string = dataSourceDataTypes[0]['data_type'];

class UploaderApp extends React.Component<IProps & FormComponentProps, UploaderAppState> {

    dataSourceProjects = dataSourceProjects;
    dataSourceDataTypes = dataSourceDataTypes;

    defaultEmpty: SelectOption = { key: "" };

    constructor(props: IProps & FormComponentProps) {
        super(props);
        this.state = {
            selectedProjectValue: initialProjectValue,
            selectedSubjectValue: '',
            selectedSessionValue: '',
            selectedDataTypeValue: initialDataTypeValue,
            isSelectedProject: false,
            isSelectedSubject: false,
            isSelectedSession: false,
            isSelectedDataType: false,
            isSelectedDataTypeOther: false,
            doneWithSelectDataType: false,
            fileList: [],
            fileListClean: [],
            hasFilesSelected: false,
            proceed: false,
        };
    }

    onSelectProjectValue = (value: SelectOption) => {
        const selectedProjectValue = value.key;
        this.setState({
            selectedProjectValue,
            isSelectedProject: true,
            selectedSubjectValue: '',
            isSelectedSubject: false,
            selectedSessionValue: '',
            isSelectedSession: false,
            selectedDataTypeValue: initialDataTypeValue,
            isSelectedDataType: false,
            isSelectedDataTypeOther: false,
            doneWithSelectDataType: false,
            proceed: false,
        });
    }

    regexpSubjectLabel = new RegExp('^[a-zA-Z0-9]*$');
    validateSubjectLabelInput = (text: string) => {
        return this.regexpSubjectLabel.test(text);
    }

    onChangeSubjectLabel = (event: any) => {
        let isValid = this.validateSubjectLabelInput(event.target.value);
        if (isValid) {
            const selectedSubjectValue = event.target.value;
            this.setState({
                selectedSubjectValue,
                isSelectedSubject: true,
                isSelectedSession: false,
                selectedSessionValue: '',
                isSelectedDataType: false,
                isSelectedDataTypeOther: false,
                doneWithSelectDataType: false,
                proceed: false,
            });
        } else {
            let selectedSubjectValue = event.target.value;
            // Do not store invalid strings and show error. 
            // Silently reset in case of empty string.
            if (selectedSubjectValue !== '') {
                selectedSubjectValue = this.state.selectedSubjectValue;
                this.openNotification('Error', `subject label "${event.target.value}" must be all 1- or 2-digit number.`, 'error', 4.5);
            }
            this.setState({
                selectedSubjectValue,
                isSelectedSubject: false,
                isSelectedSession: false,
                selectedSessionValue: '',
                isSelectedDataType: false,
                isSelectedDataTypeOther: false,
                doneWithSelectDataType: false,
                proceed: false,
            });
        }
    }

    regexpSessionLabel = new RegExp('^[a-zA-Z0-9]*$');
    validateSessionLabelInput = (text: string) => {
        return this.regexpSessionLabel.test(text);
    }

    onChangeSessionLabel = (event: any) => {
        let isValid = this.validateSessionLabelInput(event.target.value);
        if (isValid) {
            const selectedSessionValue = event.target.value;
            this.setState({
                isSelectedSession: true,
                selectedSessionValue,
                isSelectedDataType: false,
                isSelectedDataTypeOther: false,
                doneWithSelectDataType: false,
                proceed: false,
            });
        } else {
            let selectedSessionValue = event.target.value;
            // Do not store invalid strings and show error. 
            // Silently reset in case of empty string.
            if (selectedSessionValue !== '') {
                selectedSessionValue = this.state.selectedSessionValue;
                this.openNotification('Error', `Session label "${event.target.value}" must be all 1- or 2-digit number.`, 'error', 4.5);
            }
            this.setState({
                isSelectedSession: false,
                selectedSessionValue,
                isSelectedDataType: false,
                isSelectedDataTypeOther: false,
                doneWithSelectDataType: false,
                proceed: false,
            });
        }
    }

    onSelectDataTypeValue = (value: SelectOption) => {
        const selectedDataTypeValue = value.key;
        let isSelectedDataTypeOther = false;
        let doneWithSelectDataType = true;
        if (selectedDataTypeValue === 'other') {
            isSelectedDataTypeOther = true;
            doneWithSelectDataType = false;
        }
        this.setState({
            selectedDataTypeValue,
            isSelectedDataType: true,
            isSelectedDataTypeOther: isSelectedDataTypeOther,
            doneWithSelectDataType: doneWithSelectDataType,
            proceed: doneWithSelectDataType,
        });
    }

    regexpSelectedDataTypeOtherInput = new RegExp('^[a-z]*$');
    validateSelectedDataTypeOtherInput = (text: string) => {
        return this.regexpSelectedDataTypeOtherInput.test(text);
    }

    onChangeSelectedDataTypeOther = (event: any) => {
        let isValid = this.validateSelectedDataTypeOtherInput(event.target.value);
        if (isValid) {
            const selectedDataTypeValue = event.target.value;
            this.setState({
                selectedDataTypeValue,
                doneWithSelectDataType: true,
                proceed: true,
            });
        } else {
            let selectedDataTypeValue = event.target.value;
            // Do not store invalid strings and show error. 
            // Silently reset in case of empty string.
            if (selectedDataTypeValue !== '') {
                selectedDataTypeValue = this.state.selectedDataTypeValue;
                this.openNotification('Error', `other data type "${event.target.value}" must be all lower case, with no special characters.`, 'error', 4.5);
            }
            this.setState({
                selectedDataTypeValue,
                doneWithSelectDataType: false,
                proceed: false,
            });
        }
    }

    fileNameExists = (file: RcFile, fileList: RcFile[]) => {
        const duplicates = fileList.filter(item => (item.name === file.name && item.uid !== file.uid));
        if (duplicates.length > 0) {
            return true;
        } else {
            return false;
        }
    };

    openNotification = (title: string, description: string, category: 'success' | 'info' | 'error' | 'warning', duration: number) => {
        notification[category]({
            message: title,
            description: description,
            duration: duration,
        });
    };

    onAdd = (file: RcFile) => {
        if (this.fileNameExists(file, this.state.fileListClean)) {
            this.openNotification('Error', `"${file.name}" filename already exists, please rename.`, 'error', 0);
        } else {
            let fileListClean = this.state.fileListClean;
            fileListClean = [...fileListClean, file];
            const hasFilesSelected = (fileListClean.length > 0);
            this.setState({ hasFilesSelected, fileListClean });
            this.openNotification('Success', `"${file.name}" file successfully uploaded to streamer buffer.`, 'success', 4.5);
        }
    };

    onDelete = (uid: string, filename: string, e: any) => {
        e.preventDefault();
        // const fileListClean = this.state.fileListClean.filter(item => (item.name !== filename && item.uid !== uid));
        const fileListClean = this.state.fileListClean.filter(item => (item.name !== filename));
        const hasFilesSelected = (fileListClean.length > 0);
        this.setState({ hasFilesSelected, fileListClean });
    };

    handleChange = (file: RcFile, fileList: RcFile[]) => {
        let stateFileList = this.state.fileList;
        fileList = [...stateFileList, file];
        this.setState({ fileList });
        this.onAdd(file);
        return false;
    };

    // TODO: Clean label?
    cleanLabel = (labelIn: string) => {
        let labelOut = labelIn;
        return labelOut;
    }

    //Derive the target path from the target path ingredients
    getTargetPath = (
        isSelectedProject: boolean,
        projectNumber: string,
        isSelectedSubject: boolean,
        subjectLabel: string,
        isSelectedSession: boolean,
        isSelectedDataType: boolean,
        dataType: string,
        sessionLabel: string) => {

        let projectPath = <span style={{ fontWeight: 'bold', color: '#f45709' }}>/project</span>;
        let forwardSlashPath = <span style={{ fontWeight: 'bold', color: '#f45709' }}>/</span>;
        let rawPath = <span style={{ fontWeight: 'bold', color: '#f45709' }}>raw</span>;
        let subjectPath = <span style={{ fontWeight: 'bold', color: '#f45709' }}>sub-</span>;
        let sessionPath = <span style={{ fontWeight: 'bold', color: '#f45709' }}>ses-</span>;

        let projectNumberPath = <span style={{ fontStyle: 'italic' }}>(projectnumber)</span>;
        let subjectLabelPath = <span style={{ fontStyle: 'italic' }}>(subjectlabel)</span>;
        let dataTypePath = <span style={{ fontStyle: 'italic' }}>(datatype)</span>;
        let sessionLabelPath = <span style={{ fontStyle: 'italic' }}>(sessionlabel)</span>;

        if (isSelectedProject) {
            projectNumberPath = <span style={{ fontWeight: 'bold', color: '#f45709' }}>{projectNumber}</span>;
        }
        if (isSelectedSubject) {
            let cleanSubjectLabel = this.cleanLabel(subjectLabel);
            subjectLabelPath = <span style={{ fontWeight: 'bold', color: '#f45709' }}>{cleanSubjectLabel}</span>;
        }
        if (isSelectedDataType && dataType !== 'other') {
            dataTypePath = <span style={{ fontWeight: 'bold', color: '#f45709' }}>{dataType}</span>;
        }
        if (isSelectedDataType) {
            if (dataType === 'other' || dataType === '') {
                dataTypePath = <span style={{ fontStyle: 'italic' }}>(datatype)</span>;
            } else {
                dataTypePath = <span style={{ fontWeight: 'bold', color: '#f45709' }}>{dataType}</span>;
            }
        }
        if (isSelectedSession) {
            let cleanSessionLabel = this.cleanLabel(sessionLabel);
            sessionLabelPath = <span style={{ fontWeight: 'bold', color: '#f45709' }}>{cleanSessionLabel}</span>;
        }

        return <div>{projectPath}{forwardSlashPath}{projectNumberPath}{forwardSlashPath}{rawPath}{forwardSlashPath}{subjectPath}{subjectLabelPath}{forwardSlashPath}{sessionPath}{sessionLabelPath}{forwardSlashPath}{dataTypePath}{forwardSlashPath}</div>;
    };

    handleUpload = (info: any) => {
        var formData = new FormData();
        this.state.fileListClean.forEach(file => {
            formData.append('files', file);
        });

        var xhr = new XMLHttpRequest();
        xhr.addEventListener("readystatechange", function () {
            if (this.readyState === 4) {
                console.log(this.responseText);
            }
        });
        xhr.open("POST", "http://localhost:9000/upload");
        xhr.send(formData);
    };

    render() {

        const props = {
            className: "file-uploader",
            name: 'file',
            multiple: true,
            beforeUpload: this.handleChange,
            customRequest: this.handleUpload,
            showUploadList: false,
        };

        const optionsProjects = this.dataSourceProjects.map((item, key) =>
            <Option value={item.project_number}>{item.project_number}</Option>
        );

        const optionsDataTypes = this.dataSourceDataTypes.map((item, key) =>
            <Option value={item.data_type}>{item.data_type}</Option>
        );

        const columns = [
            {
                title: 'filename',
                dataIndex: 'name',
                key: 'name',
                render: (text: string) => <span style={{ color: '#f45709' }}>{text}</span>,
            },
            {
                title: '',
                key: 'action',
                render: (text: string, record: any) => (
                    <span
                        onClick={(e) => { this.onDelete(record.uid, record.name, e); }}
                    >
                        <Icon type="close" />
                    </span>
                ),
            },
        ];

        const targetPath = this.getTargetPath(
            this.state.isSelectedProject,
            this.state.selectedProjectValue,
            this.state.isSelectedSubject,
            this.state.selectedSubjectValue,
            this.state.isSelectedSession,
            this.state.isSelectedDataType,
            this.state.selectedDataTypeValue,
            this.state.selectedSessionValue);

        return (
            <Content style={{ background: '#f0f2f5' }}>
                <div style={{ padding: 10 }}>
                    <Row>
                        <Col span={24}>
                            <Card
                                style={{ borderRadius: 4, boxShadow: '1px 1px 1px #ddd' }}
                                className="shadow"
                            >
                                {this.state.hasFilesSelected && this.state.proceed && <Button size="large" style={{ backgroundColor: "#52c41a", color: "#fff", width: "200px", float: "right" }} onClick={this.handleUpload}>Upload</Button>}
                                {(!this.state.hasFilesSelected || !this.state.proceed) && <Button disabled={true} size="large" style={{ width: "200px", float: "right" }}>Upload</Button>}
                            </Card>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={12}>
                            <Card
                                title="Source"
                                style={{ borderRadius: 4, boxShadow: '1px 1px 1px #ddd', minHeight: '600px', marginTop: 10 }}
                                className="shadow"
                            >
                                <h1>Select file(s)</h1>
                                <Dragger {...props}>
                                    <p className="ant-upload-drag-icon">
                                        <Icon type="inbox" />
                                    </p>
                                    <p className="ant-upload-text">Click or drag files to this area</p>
                                    <p className="ant-upload-hint">Select one or more files.</p>
                                </Dragger>
                                <br /><br />
                                <Table columns={columns} dataSource={this.state.fileListClean} pagination={false} size={"small"} />

                                {/* <Button
                                    type="primary"
                                    onClick={this.handleUpload}
                                    style={{ marginTop: 16 }}
                                >Upload</Button> */}
                            </Card>
                        </Col>
                        <Col span={12}>
                            <Card
                                title="Destination"
                                extra={targetPath}
                                style={{ marginLeft: 10, borderRadius: 4, boxShadow: '1px 1px 1px #ddd', minHeight: '600px', marginTop: 10 }}
                                className="shadow"
                            >
                                <h1>Select structure</h1>
                                <div style={{ marginTop: '20px' }}>
                                    <Form layout="vertical" hideRequiredMark>
                                        <Row gutter={16}>
                                            <Col span={12}>
                                                <Form.Item label="Project number">
                                                    <Select
                                                        labelInValue
                                                        defaultValue={this.defaultEmpty}
                                                        placeholder="Select project"
                                                        onSelect={this.onSelectProjectValue}
                                                        style={{ width: '400px' }}>
                                                        {optionsProjects}
                                                    </Select>
                                                </Form.Item>
                                            </Col>
                                            <Col span={12}>

                                            </Col>
                                        </Row>

                                        {this.state.isSelectedProject &&
                                            <Row gutter={16}>
                                                <Col span={12}>
                                                    <Form.Item label="Set subject label">
                                                        <Input placeholder="Set subject label" onChange={this.onChangeSubjectLabel} style={{ width: '400px' }} />&nbsp;
                                                        <Tooltip title="subject label must be of form [a-zA-Z0-9]*"><Icon type="question-circle-o" /></Tooltip>
                                                    </Form.Item>
                                                </Col>
                                                <Col span={12}>

                                                </Col>
                                            </Row>
                                        }

                                        {this.state.isSelectedSubject &&
                                            <Row gutter={16}>
                                                <Col span={12}>
                                                    <Form.Item label="Set session label">
                                                        <Input placeholder="Set session label" onChange={this.onChangeSessionLabel} style={{ width: '400px' }} />&nbsp;
                                                        <Tooltip title="session label must be of form [a-zA-Z0-9]*"><Icon type="question-circle-o" /></Tooltip>
                                                    </Form.Item>
                                                </Col>
                                                <Col span={12}>

                                                </Col>
                                            </Row>
                                        }

                                        {this.state.isSelectedSession &&
                                            <Row gutter={16}>
                                                <Col span={12}>
                                                    <Form.Item label="Select data type">
                                                        <Select
                                                            labelInValue
                                                            defaultValue={this.defaultEmpty}
                                                            placeholder="Select data type"
                                                            onSelect={this.onSelectDataTypeValue}
                                                            style={{ width: '400px' }}>
                                                            {optionsDataTypes}
                                                        </Select>
                                                    </Form.Item>
                                                </Col>
                                                <Col span={12}>

                                                </Col>
                                            </Row>
                                        }

                                        {this.state.isSelectedDataTypeOther &&
                                            <Row gutter={16}>
                                                <Col span={12}>
                                                    <Form.Item>
                                                        <Input placeholder="Insert other data type" onChange={this.onChangeSelectedDataTypeOther} style={{ width: '400px' }} />&nbsp;
                                                            <Tooltip title="other data type must be lower case string with no special characters">
                                                            <Icon type="question-circle-o" />
                                                        </Tooltip>
                                                    </Form.Item>
                                                </Col>
                                                <Col span={12}>

                                                </Col>
                                            </Row>
                                        }
                                    </Form>
                                </div>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </Content >
        );
    }
}

const Uploader = Form.create<IProps & FormComponentProps>()(UploaderApp);
export default Uploader;
