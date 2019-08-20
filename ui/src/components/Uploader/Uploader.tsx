import React from 'react';
import { Select, Form, Row, Col, Upload, Layout, Card, Icon, Button, Table, message } from 'antd';
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
  selectedProjectValue: string,
  selectedSubjectSessionValue: string,
  selectedDataTypeValue: string,
  isSelectedProject: boolean,
  isSelectedSubjectSession: boolean,
  isSelectedDataType: boolean,
  fileList: FileListItem[],
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
        "list_subject_session": [
          {
            "id": 1,
            "subject_session": "1-1"
          },
          {
            "id": 2,
            "subject_session": "1-2"
          },
          {
            "id": 1,
            "subject_session": "2-1"
          },
          {
            "id": 2,
            "subject_session": "2-2"
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
        "list_subject_session": [
          {
            "id": 1,
            "subject_session": "1-1"
          },
          {
            "id": 2,
            "subject_session": "1-2"
          },
          {
            "id": 1,
            "subject_session": "2-1"
          },
          {
            "id": 2,
            "subject_session": "2-2"
          }
        ]
      }
    ]
  }
];

const dataSourceDataTypes = [
  {
    "id": 1,
    "data_type": "MEG"
  },
  {
    "id": 2,
    "data_type": "MRI"
  },
  {
    "id": 3,
    "data_type": "Other"
  }
];

const initialProjectValue: string = dataSourceProjects[0]['project_number'];
const initialSubjectSessionValue: string = "1-1";
const initialLabValue: string = dataSourceDataTypes[0]['data_type'];

class UploaderApp extends React.Component<IProps & FormComponentProps, UploaderAppState> {

  dataSourceProjects = dataSourceProjects;
  dataSourceSubjectSessions = dataSourceProjects[0]['list_experiments'][0]['list_subject_session'];
  dataSourceDataTypes = dataSourceDataTypes;

  constructor(props: IProps & FormComponentProps) {
    super(props);
    this.state = {
      selectedProjectValue: initialProjectValue,
      selectedSubjectSessionValue: initialSubjectSessionValue,
      selectedDataTypeValue: initialLabValue,
      isSelectedProject: false,
      isSelectedSubjectSession: false,
      isSelectedDataType: false,
      fileList: [
      ],
      proceed: false,
    };
  }

  onSelectProjectValue = (value: SelectOption) => {
    const selectedProjectValue = value.key;
    this.setState({
      selectedProjectValue,
      isSelectedProject: true,
      isSelectedSubjectSession: false,
      isSelectedDataType: false,
      proceed: false,
    });
  }

  onSelectSubjectSessionValue = (value: SelectOption) => {
    const selectedSubjectSessionValue = value.key;
    this.setState({
      selectedSubjectSessionValue,
      isSelectedProject: true,
      isSelectedSubjectSession: true,
      isSelectedDataType: false,
      proceed: false,
    });
  }

  onSelectDataTypeValue = (value: SelectOption) => {
    const selectedDataTypeValue = value.key;
    this.setState({
      selectedDataTypeValue,
      isSelectedProject: true,
      isSelectedSubjectSession: true,
      isSelectedDataType: true,
      proceed: true,
    });
  }

  handleChange = (info: any) => {
    let fileList = [...info.fileList];
    this.setState({ fileList });

    console.log(info);

    const { status } = info.file;
    if (status !== 'uploading to local buffer') {
      console.log(info.file, info.fileList);
    }
    if (status === 'done') {
      message.success(`${info.file.name} file uploaded successfully to local buffer.`);
    } else if (status === 'error') {
      message.error(`${info.file.name} file upload to local buffer failed.`);
    }
  };

  render() {

    const props = {
      name: 'file',
      multiple: true,
      action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
      onChange: this.handleChange,
      showUploadList: false,
    };

    const optionsProjects = this.dataSourceProjects.map((item, key) =>
      <Option value={item.project_number}>{item.project_number}</Option>
    );

    const optionsSubjectSessions = this.dataSourceSubjectSessions.map((item, key) =>
      <Option value={item.subject_session}>{item.subject_session}</Option>
    );

    const optionsDataTypes = this.dataSourceDataTypes.map((item, key) =>
      <Option value={item.data_type}>{item.data_type}</Option>
    );

    const columns = [
      {
        title: 'filename',
        dataIndex: 'name',
        key: 'name',
        render: (text: string) => <a style={{ color: '#f45709' }}>{text}</a>,
      }
    ];

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
                style={{ borderRadius: 4, boxShadow: '1px 1px 1px #ddd', minHeight: '500px', marginTop: 10 }}
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
                <Table columns={columns} dataSource={this.state.fileList} pagination={false} size={"small"} />
              </Card>
            </Col>
            <Col span={12}>
              <Card
                style={{ marginLeft: 10, borderRadius: 4, boxShadow: '1px 1px 1px #ddd', minHeight: '500px', marginTop: 10 }}
                className="shadow"
              >
                <h1>Select structure</h1>
                <div style={{ marginTop: '20px' }}>
                  <Form layout="vertical" hideRequiredMark>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item label="Project">
                          <Select
                            labelInValue
                            defaultValue={{ key: this.state.selectedProjectValue }}
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
                          <Form.Item label="Subject-Session">
                            <Select
                              labelInValue
                              defaultValue={{ key: this.state.selectedSubjectSessionValue }}
                              placeholder="Select subject-session"
                              onSelect={this.onSelectSubjectSessionValue}
                              style={{ width: '400px' }}>
                              {optionsSubjectSessions}
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col span={12}>

                        </Col>
                      </Row>
                    }

                    {this.state.isSelectedSubjectSession &&
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item label="Data Type">
                            <Select
                              labelInValue
                              defaultValue={{ key: this.state.selectedDataTypeValue }}
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
