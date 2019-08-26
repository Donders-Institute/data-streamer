import React from 'react';
import { Select, Form, Row, Col, Upload, Layout, Card, Icon, Button, Table, notification, Input, Tooltip } from 'antd';
import { FormComponentProps } from "antd/lib/form"
const { Content } = Layout;
const { Option } = Select;

const { Dragger } = Upload;

interface IProps {
    title?: string | undefined;
}

type FileListItem = {
    uid: string,
    name: string,
    url: string,
    size: number,
    type: string,
    status: "done" | "error" | "success" | "uploading" | "removed" | undefined,
}

type UploaderAppState = {
    destination: string,
    selectedProjectValue: string,
    selectedSubjectValue: string,
    selectedSessionValue: string,
    selectedDataTypeValue: string,
    isSelectedProject: boolean,
    isSelectedSubject: boolean,
    isSelectedSession: boolean,
    isSelectedDataType: boolean,
    isSelectedDataTypeOther: boolean,
    fileList: FileListItem[],
    fileListClean: FileListItem[],
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
const initialSubjectValue: string = "1";
const initialSessionValue: string = "1";
const initialDataTypeValue: string = dataSourceDataTypes[0]['data_type'];

class UploaderApp extends React.Component<IProps & FormComponentProps, UploaderAppState> {

    dataSourceProjects = dataSourceProjects;
    dataSourceSubjects = dataSourceProjects[0]['list_experiments'][0]['list_subjects'];
    dataSourceSessions = dataSourceProjects[0]['list_experiments'][0]['list_subjects'][0]['list_sessions'];
    dataSourceDataTypes = dataSourceDataTypes;

    defaultEmpty: SelectOption = { key: "" };

    constructor(props: IProps & FormComponentProps) {
        super(props);
        this.state = {
            destination: "/{projectnumber}/sub-{subjectlabel}/ses-{sessionlabel}/{datatype}",
            selectedProjectValue: initialProjectValue,
            selectedSubjectValue: initialSubjectValue,
            selectedSessionValue: initialSessionValue,
            selectedDataTypeValue: initialDataTypeValue,
            isSelectedProject: false,
            isSelectedSubject: false,
            isSelectedSession: false,
            isSelectedDataType: false,
            isSelectedDataTypeOther: false,
            fileList: [],
            fileListClean: [],
            proceed: false,
        };
    }

    onSelectProjectValue = (value: SelectOption) => {
        const selectedProjectValue = value.key;
        const destination = '/' + selectedProjectValue + '/sub-{subjectlabel}/ses-{sessionlabel}/{datatype}';
        this.setState({
            selectedProjectValue,
            destination,
            isSelectedProject: true,
            isSelectedSubject: false,
            isSelectedSession: false,
            isSelectedDataType: false,
            isSelectedDataTypeOther: false,
            proceed: false,
        });
    }

    onSelectSubjectValue = (value: SelectOption) => {
        const selectedSubjectValue = value.key;
        const destination = '/' + this.state.selectedProjectValue + '/sub-' + selectedSubjectValue + '/ses-<sessionlabel>/<datatype>';
        this.setState({
            selectedSubjectValue,
            destination,
            isSelectedProject: true,
            isSelectedSubject: true,
            isSelectedSession: false,
            isSelectedDataType: false,
            proceed: false,
            isSelectedDataTypeOther: false,
        });
    }

    onSelectSessionValue = (value: SelectOption) => {
        const selectedSessionValue = value.key;
        const destination = '/' + this.state.selectedProjectValue + '/sub-' + this.state.selectedSubjectValue + '/ses-' + selectedSessionValue + '/<datatype>';
        this.setState({
            selectedSessionValue,
            destination,
            isSelectedProject: true,
            isSelectedSubject: true,
            isSelectedSession: true,
            isSelectedDataType: false,
            proceed: false,
            isSelectedDataTypeOther: false,
        });
    }

    onSelectDataTypeValue = (value: SelectOption) => {
        const selectedDataTypeValue = value.key;
        const destination = '/' + this.state.selectedProjectValue + '/sub-' + this.state.selectedSubjectValue + '/ses-' + this.state.selectedSessionValue + '/' + selectedDataTypeValue;
        let isSelectedDataTypeOther = false;
        let proceed = true;
        if (selectedDataTypeValue === 'other') {
            isSelectedDataTypeOther = true
            proceed = false;
        }
        this.setState({
            selectedDataTypeValue,
            destination,
            isSelectedProject: true,
            isSelectedSubject: true,
            isSelectedSession: true,
            isSelectedDataType: true,
            isSelectedDataTypeOther: isSelectedDataTypeOther,
            proceed: proceed,
        });
    }

    regexp = new RegExp('^[a-z]+$');
    validateInput = (text: string) => {
        return this.regexp.test(text);
    }

    onChangeSelectedDataTypeOther = (event: any) => {
        let isValid = this.validateInput(event.target.value);
        if (isValid) {
            const selectedDataTypeValue = event.target.value;
            this.setState({
                selectedDataTypeValue,
                isSelectedProject: true,
                isSelectedSubject: true,
                isSelectedSession: true,
                isSelectedDataType: true,
                isSelectedDataTypeOther: true,
                proceed: true,
            });
        } else {
            let selectedDataTypeValue = event.target.value;
            // Do not store invalid strings. Reset in case of empty string.
            if (selectedDataTypeValue !== '') {
                selectedDataTypeValue = this.state.selectedDataTypeValue;
            }
            this.openNotification('Error', `other data type "${event.target.value}" must be all lower case, with no special characters.`, 'error', 4.5);
            this.setState({
                selectedDataTypeValue,
                isSelectedProject: true,
                isSelectedSubject: true,
                isSelectedSession: true,
                isSelectedDataType: true,
                isSelectedDataTypeOther: true,
                proceed: false,
            });
        }
    }

    fileNameExists = (fileItem: FileListItem, fileList: FileListItem[]) => {
        const duplicates = fileList.filter(item => (item.name === fileItem.name && item.uid !== fileItem.uid));
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

    onAdd = (fileItem: FileListItem) => {
        if (this.fileNameExists(fileItem, this.state.fileListClean)) {
            this.openNotification('Error', `"${fileItem.name}" filename already exists, please rename.`, 'error', 0);
        } else {
            let fileListClean = this.state.fileListClean;
            fileListClean.push(fileItem);
            this.setState({ fileListClean });
            this.openNotification('Success', `"${fileItem.name}" file successfully uploaded to streamer buffer.`, 'success', 4.5);
        }
    };

    onDelete = (uid: string, filename: string, e: any) => {
        e.preventDefault();
        const fileListClean = this.state.fileListClean.filter(item => (item.name !== filename && item.uid !== uid));
        this.setState({ fileListClean });
    };

    handleChange = (info: any) => {
        let fileList = [...info.fileList];
        const { status } = info.file;
        if (status === 'done') {
            this.onAdd(info.file);
        } else if (status === 'error') {
            this.openNotification('Error', `"${info.file.name}" filename already exists, please rename.`, 'error', 0);
        }
        this.setState({ fileList });
    };

    // Pad with leading zero if number has 1 digit
    cleanLabel = (labelIn: string) => {
        let labelOut = labelIn;
        if (labelIn.length == 2) {
            labelOut = labelIn;
        } else if (labelIn.length < 2) {
            labelOut = labelIn.padStart(2, '0');
        } else {
            this.openNotification('Error', `"${labelIn}" invalid label to be cleaned.`, 'error', 0);
        }
        return labelOut;
    }

    //Derive the target path from the target path ingredients
    getTargetPath = (
        isSelectedProject: boolean,
        projectNumber: string,
        isSelectedSubject: boolean,
        subjectLabel: string,
        isSelectedSession: boolean,
        sessionLabel: string,
        isSelectedDataType: boolean,
        dataType: string) => {

        let forwardSlashPath = <span style={{ fontWeight: 'bold', color: '#f45709' }}>/</span>;
        let subjectPath = <span style={{ fontWeight: 'bold', color: '#f45709' }}>sub-</span>;
        let sessionPath = <span style={{ fontWeight: 'bold', color: '#f45709' }}>ses-</span>;

        let projectNumberPath = <span style={{ fontStyle: 'italic' }}>projectnumber</span>;
        let subjectLabelPath = <span style={{ fontStyle: 'italic' }}>subjectlabel</span>;
        let sessionLabelPath = <span style={{ fontStyle: 'italic' }}>sessionlabel</span>;
        let dataTypePath = <span style={{ fontStyle: 'italic' }}>datatype</span>;

        if (isSelectedProject) {
            projectNumberPath = <span style={{ fontWeight: 'bold', color: '#f45709' }}>{projectNumber}</span>;
        }
        if (isSelectedSubject) {
            let cleanSubjectLabel = this.cleanLabel(subjectLabel);
            subjectLabelPath = <span style={{ fontWeight: 'bold', color: '#f45709' }}>{cleanSubjectLabel}</span>;
        }
        if (isSelectedSession) {
            let cleanSessionLabel = this.cleanLabel(sessionLabel);
            sessionLabelPath = <span style={{ fontWeight: 'bold', color: '#f45709' }}>{cleanSessionLabel}</span>;
        }
        if (isSelectedDataType && dataType !== 'other') {
            dataTypePath = <span style={{ fontWeight: 'bold', color: '#f45709' }}>{dataType}</span>;
        }
        if (isSelectedDataType) {
            if (dataType === 'other' || dataType === '') {
                dataTypePath = <span style={{ fontStyle: 'italic' }}>datatype</span>;
            } else {
                dataTypePath = <span style={{ fontWeight: 'bold', color: '#f45709' }}>{dataType}</span>;
            }
        }

        return <div>{forwardSlashPath}{projectNumberPath}{forwardSlashPath}{subjectPath}{subjectLabelPath}{forwardSlashPath}{sessionPath}{sessionLabelPath}{forwardSlashPath}{dataTypePath}</div>;
    };

    render() {

        const props = {
            name: 'file',
            multiple: true,
            action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
            headers: {
                authorization: 'authorization-text',
            },
            onChange: this.handleChange,
            showUploadList: false,
        };

        const optionsProjects = this.dataSourceProjects.map((item, key) =>
            <Option value={item.project_number}>{item.project_number}</Option>
        );

        const optionsSubjects = this.dataSourceSubjects.map((item, key) =>
            <Option value={item.subject}>{item.subject}</Option>
        );

        const optionsSessions = this.dataSourceSessions.map((item, key) =>
            <Option value={item.session}>{item.session}</Option>
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
            this.state.selectedSessionValue,
            this.state.isSelectedDataType,
            this.state.selectedDataTypeValue);

        return (
            <Content style={{ background: '#f0f2f5' }}>
                <div style={{ padding: 10 }}>
                    <Row>
                        <Col span={24}>
                            <Card
                                style={{ borderRadius: 4, boxShadow: '1px 1px 1px #ddd' }}
                                className="shadow"
                            >
                                {this.state.proceed && <Button size="large" style={{ backgroundColor: "#52c41a", color: "#fff", width: "200px", float: "right" }}>Upload</Button>}
                                {!this.state.proceed && <Button disabled={true} size="large" style={{ width: "200px", float: "right" }}>Upload</Button>}
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
                                <Dragger {...props}>
                                    <p className="ant-upload-drag-icon">
                                        <Icon type="inbox" />
                                    </p>
                                    <p className="ant-upload-text">Click or drag files to this area</p>
                                    <p className="ant-upload-hint">
                                        Select one or more files.
                                    </p>
                                </Dragger>
                                <br /><br />
                                <Table columns={columns} dataSource={this.state.fileListClean} pagination={false} size={"small"} />
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
                                                        <Select
                                                            labelInValue
                                                            defaultValue={this.defaultEmpty}
                                                            placeholder="Select subject"
                                                            onSelect={this.onSelectSubjectValue}
                                                            style={{ width: '400px' }}>
                                                            {optionsSubjects}
                                                        </Select>
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
                                                        <Select
                                                            labelInValue
                                                            defaultValue={this.defaultEmpty}
                                                            placeholder="Select session"
                                                            onSelect={this.onSelectSessionValue}
                                                            style={{ width: '400px' }}>
                                                            {optionsSessions}
                                                        </Select>
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
                                                            <Tooltip title="other data type must be all lower case, with no special characters">
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
