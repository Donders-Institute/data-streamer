import React from "react";
import {
    Select,
    Form,
    Row,
    Col,
    Input
} from "antd";
import { FormComponentProps } from "antd/lib/form";
import { Project, SelectOption, InputValidationStatuses } from "../../../../types/types";
import { validateSubjectLabelInput, validateSessionLabelInput, validateSelectedDataTypeOtherInput } from "../../services/inputValidation/inputValidation";

const { Option } = Select;

interface IProps {
    projectList: Project[];
    selectedProjectStatus: (typeof InputValidationStatuses)[number];
    selectedSubjectStatus: (typeof InputValidationStatuses)[number];
    selectedSessionStatus: (typeof InputValidationStatuses)[number];
    selectedDataTypeStatus: (typeof InputValidationStatuses)[number];
    selectedDataTypeOtherStatus: (typeof InputValidationStatuses)[number];
    isSelectedProject: boolean;
    projectNumber: string;
    subjectLabel: string;
    isSelectedDataTypeOther: boolean;
    dataType: string;
    sessionLabel: string;
    handleSelectProject: (projectNumber: string) => Promise<void>;
    handleChangeSubjectLabel: (subjectLabel: string) => Promise<void>;
    handleChangeSessionLabel: (sessionLabel: string) => Promise<void>;
    handleSelectDataType: (dataType: string) => Promise<void>;
    handleChangeSelectedDataTypeOther: (dataTypeOther: string) => Promise<void>;
}

const dataTypesList = [
    {
        id: 1,
        dataType: "mri"
    },
    {
        id: 2,
        dataType: "meg"
    },
    {
        id: 3,
        dataType: "eeg"
    },
    {
        id: 4,
        dataType: "ieeg"
    },
    {
        id: 5,
        dataType: "beh"
    },
    {
        id: 6,
        dataType: "other"
    }
];

const StructureSelectorForm: React.FC<IProps & FormComponentProps> = (
    {
        form,
        projectList,
        selectedProjectStatus,
        selectedSubjectStatus,
        selectedSessionStatus,
        selectedDataTypeStatus,
        selectedDataTypeOtherStatus,
        isSelectedProject,
        projectNumber,
        subjectLabel,
        isSelectedDataTypeOther,
        dataType,
        sessionLabel,
        handleSelectProject,
        handleChangeSubjectLabel,
        handleChangeSessionLabel,
        handleSelectDataType,
        handleChangeSelectedDataTypeOther
    }) => {
    const { getFieldDecorator } = form;

    const projectNumberOption: SelectOption = { key: (projectNumber ? projectNumber : "projectnumber") };
    const dataTypeOption: SelectOption = { key: (dataType ? dataType : "datatype") };

    const optionsProjects = projectList!.map((project, key) => (
        <Option value={project.projectNumber} key={key}>{project.projectNumber}</Option>
    ));

    const optionsDataTypes = dataTypesList.map((item, key) => (
        <Option value={item.dataType} key={key}>{item.dataType}</Option>
    ));

    async function validateSubjectLabel(value: string) {
        let isValid = validateSubjectLabelInput(value);
        if (!isValid) {
            throw new Error("Should be combination of numbers and alphabets with no special characters. Examples: '1', 'mri02'");
        }
    };

    async function validateSessionLabel(value: string) {
        let isValid = validateSessionLabelInput(value);
        if (!isValid) {
            throw new Error("Should be combination of numbers and alphabets with no special characters. Examples: '1', 'mri02'");
        }
    };

    async function validateDataTypeOther(value: string) {
        let isValid = validateSelectedDataTypeOtherInput(value);
        if (!isValid) {
            throw new Error("Should be lower case string without special characters. Examples: eyelink', 'test'");
        }
    };

    return (
        <Form layout="vertical" hideRequiredMark>
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item
                        label={<span style={{ fontWeight: "bold" }}>Select project</span>}
                        hasFeedback
                        validateStatus={selectedProjectStatus}
                        help={<span style={{ fontStyle: "italic" }}>Projects for which you are entitled to upload data to</span>}
                    >
                        <Select
                            labelInValue
                            defaultValue={projectNumberOption}
                            onSelect={(value: SelectOption) => {
                                const projectNumber = value.key;
                                handleSelectProject(projectNumber);
                            }}
                            style={{ width: "400px" }}
                        >
                            {optionsProjects}
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={12}></Col>
            </Row>

            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item
                        label={<span style={{ fontWeight: "bold" }}>Set subject label</span>}
                        hasFeedback
                        validateStatus={selectedSubjectStatus}
                        help={<span style={{ fontStyle: "italic" }}>Should be combination of numbers and alphabets without special characters. Example: '009' or 'p02'</span>}
                    >
                        {
                            getFieldDecorator("subjectlabel", {
                                initialValue: subjectLabel,
                                rules: [
                                    { required: true, message: "Please input your subject label" },
                                    {
                                        validator: (value: any) => {
                                            const stringValue = value as string;
                                            validateSubjectLabel(stringValue);
                                        }
                                    }
                                ]
                            })(
                                <Input
                                    placeholder="subjectlabel"
                                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                        const subjectLabel = event.target.value;
                                        handleChangeSubjectLabel(subjectLabel);
                                    }}
                                    style={{ width: "400px" }}
                                    disabled={!isSelectedProject}
                                />,
                            )}
                    </Form.Item>
                </Col>
                <Col span={12}></Col>
            </Row>

            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item
                        label={<span style={{ fontWeight: "bold" }}>Set session label</span>}
                        hasFeedback
                        validateStatus={selectedSessionStatus}
                        help={<span style={{ fontStyle: "italic" }}>Should be combination of numbers and alphabets with no special characters. Example: 'mri02' or 'tms01'</span>}
                    >
                        {
                            getFieldDecorator("sessionlabel", {
                                initialValue: sessionLabel,
                                rules: [
                                    { required: true, message: "Please input your session label" },
                                    {
                                        validator: (value: any) => {
                                            const stringValue = value as string;
                                            validateSessionLabel(stringValue);
                                        }
                                    }
                                ]
                            })(
                                <Input
                                    placeholder="sessionlabel"
                                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                        const sessionLabel = event.target.value;
                                        handleChangeSessionLabel(sessionLabel);
                                    }}
                                    style={{ width: "400px" }}
                                    disabled={!isSelectedProject}
                                />,
                            )}
                    </Form.Item>
                </Col>
                <Col span={12}></Col>
            </Row>

            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item
                        label={<span style={{ fontWeight: "bold" }}>Select data type</span>}
                        hasFeedback
                        validateStatus={selectedDataTypeStatus}
                        help={<span style={{ fontStyle: "italic" }}>Modality subfolder in which the data will be stored</span>}
                    >
                        <Select
                            labelInValue
                            defaultValue={dataTypeOption}
                            onSelect={(value: SelectOption) => {
                                const dataType = value.key;
                                handleSelectDataType(dataType);
                            }}
                            style={{ width: "400px" }}
                            disabled={!isSelectedProject}
                        >
                            {optionsDataTypes}
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={12}></Col>
            </Row>

            {isSelectedDataTypeOther && (
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Set data type other"
                            hasFeedback
                            validateStatus={selectedDataTypeOtherStatus}
                            help={<span style={{ fontStyle: "italic" }}>Should be lower case string, optionally with numbers, dashes ('-'), and underscores ('_');'. Example: 'eyetracker' or 'audio-left'</span>}
                        >
                            {
                                getFieldDecorator("datatypeother", {
                                    initialValue: dataType,
                                    rules: [
                                        { required: true, message: "Please input your other data type" },
                                        {
                                            validator: (value: any) => {
                                                const stringValue = value as string;
                                                validateDataTypeOther(stringValue);
                                            }
                                        }
                                    ]
                                })(
                                    <Input
                                        placeholder="datatype"
                                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                            const dataTypeOther = event.target.value;
                                            handleChangeSelectedDataTypeOther(dataTypeOther);
                                        }}
                                        style={{ width: "400px" }}
                                        disabled={!isSelectedProject}
                                    />,
                                )}
                        </Form.Item>
                    </Col>
                    <Col span={12}></Col>
                </Row>
            )}
        </Form>
    );
};

const StructureSelector = Form.create<IProps & FormComponentProps>()(StructureSelectorForm);

export default StructureSelector;
