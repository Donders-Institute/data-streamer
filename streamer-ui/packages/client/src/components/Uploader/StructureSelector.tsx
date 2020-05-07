import React from "react";
import {
    Select,
    Form,
    Row,
    Col,
    Input
} from "antd";
import { FormComponentProps } from "antd/lib/form";
import { ProjectList, SelectOption, ValidateStatuses } from "./types";
import { validateSubjectLabelInput, validateSessionLabelInput, validateSelectedDataTypeOtherInput } from "./utils";

const { Option } = Select;

interface IProps {
    projectList: ProjectList;
    selectedProjectStatus: (typeof ValidateStatuses)[number];
    selectedSubjectStatus: (typeof ValidateStatuses)[number];
    selectedSessionStatus: (typeof ValidateStatuses)[number];
    selectedDataTypeStatus: (typeof ValidateStatuses)[number];
    selectedDataTypeOtherStatus: (typeof ValidateStatuses)[number];
    isSelectedProject: boolean;
    projectNumber: string;
    subjectLabel: string;
    isSelectedDataTypeOther: boolean;
    dataType: string;
    sessionLabel: string;
    handleSelectProjectValue: (value: SelectOption) => void;
    handleChangeSubjectLabel: (event: any) => void;
    handleChangeSessionLabel: (event: any) => void;
    handleSelectDataTypeValue: (value: SelectOption) => void;
    handleChangeSelectedDataTypeOther: (event: any) => void;
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
        handleSelectProjectValue,
        handleChangeSubjectLabel,
        handleChangeSessionLabel,
        handleSelectDataTypeValue,
        handleChangeSelectedDataTypeOther
    }) => {
    const { getFieldDecorator } = form;

    const projectNumberOption: SelectOption = { key: (projectNumber ? projectNumber : "projectnumber") };
    const dataTypeOption: SelectOption = { key: (dataType ? dataType : "datatype") };

    const optionsProjects = projectList!.map((project, key) => (
        <Option value={project.number} key={key}>{project.number}</Option>
    ));

    const optionsDataTypes = dataTypesList.map((item, key) => (
        <Option value={item.dataType} key={key}>{item.dataType}</Option>
    ));

    const validateSubjectLabel = async (rule: any, value: string) => {
        let isValid = validateSubjectLabelInput(value);
        if (!isValid) {
            throw new Error("Should be combination of numbers and alphabets with no special characters. Examples: '1', 'mri02'");
        }
    };

    const validateSessionLabel = async (rule: any, value: string) => {
        let isValid = validateSessionLabelInput(value);
        if (!isValid) {
            throw new Error("Should be combination of numbers and alphabets with no special characters. Examples: '1', 'mri02'");
        }
    };

    const validateDataTypeOther = async (rule: any, value: string) => {
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
                            onSelect={handleSelectProjectValue}
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
                        {getFieldDecorator("subjectlabel", {
                            initialValue: subjectLabel,
                            rules: [
                                { required: true, message: "Please input your subject label" },
                                { validator: validateSubjectLabel }
                            ]
                        })(
                            <Input
                                placeholder="subjectlabel"
                                onChange={handleChangeSubjectLabel}
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
                        {getFieldDecorator("sessionlabel", {
                            initialValue: sessionLabel,
                            rules: [
                                { required: true, message: "Please input your session label" },
                                { validator: validateSessionLabel }
                            ]
                        })(
                            <Input
                                placeholder="sessionlabel"
                                onChange={handleChangeSessionLabel}
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
                            onSelect={handleSelectDataTypeValue}
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
                            help={<span style={{ fontStyle: "italic" }}>Should be lower case string, optionally with numbers, dashes ('-'), underscores ('_'), and '&amp;'. Example: 'eyetracker' or 'audio-left'</span>}
                        >
                            {getFieldDecorator("datatypeother", {
                                initialValue: dataType,
                                rules: [
                                    { required: true, message: "Please input your other data type" },
                                    { validator: validateDataTypeOther }
                                ]
                            })(
                                <Input
                                    placeholder="datatype"
                                    onChange={handleChangeSelectedDataTypeOther}
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
