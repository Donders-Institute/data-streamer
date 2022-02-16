import React, { Dispatch } from "react";

import { Row, Col, Form, Select, Typography } from "antd";
import { FormComponentProps } from "antd/lib/form";

import {
    Project,
    UploadState,
    UploadAction,
    FormSelectConfig,
    FormInputConfig,
    InputValidationStatuses,
    UploadActionType,
    StructureSelection
} from "../../../../types/types";

import configureInputSubjectLabel from "../../../../services/configureFormFields/configureInputSubjectLabel";
import configureInputSessionLabel from "../../../../services/configureFormFields/configureInputSessionLabel";
import configureSelectDataType from "../../../../services/configureFormFields/configureSelectDataType";
import configureInputDataTypeOther from "../../../../services/configureFormFields/configureInputDataTypeOther";

import FormSelect from "../../../../components/FormSelect/FormSelect";
import FormInput from "../../../../components/FormInput/FormInput";

const { Item } = Form;
const { Option } = Select;
const { Text } = Typography;

interface StructureSelectorProps {
    projectList: Project[];
    uploadState: UploadState;
    uploadDispatch: Dispatch<UploadAction>;
}

const StructureSelectorForm: React.FC<StructureSelectorProps & FormComponentProps> = ({
    projectList,
    uploadState,
    uploadDispatch,
    form
}) => {
    // Some styling
    const selectStyle = { width: "400px" } as React.CSSProperties | undefined;
    const inputStyle = { width: "400px" } as React.CSSProperties | undefined;
    const labelStyle = { fontWeight: "bold" } as React.CSSProperties | undefined;
    const labelStyleDataTypeOther = {} as React.CSSProperties | undefined;
    const helpStyle = { fontStyle: "italic" } as React.CSSProperties | undefined;

    let configInputSubjectLabel: FormInputConfig;
    let configInputSessionLabel: FormInputConfig;
    let configSelectDataType: FormSelectConfig;
    let configInputDataTypeOther: FormInputConfig;

    configInputSubjectLabel = configureInputSubjectLabel({
        inputStyle,
        labelStyle,
        helpStyle,
        uploadState,
        uploadDispatch,
        form
    });

    configInputSessionLabel = configureInputSessionLabel({
        inputStyle,
        labelStyle,
        helpStyle,
        uploadState,
        uploadDispatch,
        form
    });

    configSelectDataType = configureSelectDataType({
        selectStyle,
        labelStyle,
        helpStyle,
        uploadState,
        uploadDispatch
    });

    configInputDataTypeOther = configureInputDataTypeOther({
        inputStyle,
        labelStyle: labelStyleDataTypeOther,
        helpStyle,
        uploadState,
        uploadDispatch,
        form
    });

    return (
        <Form layout="vertical" hideRequiredMark>
            <Row gutter={16}>
                <Col span={12}>
                    <Item
                        hasFeedback
                        label={<span style={labelStyle}>Select project</span>}
                        help={<span style={helpStyle}>Projects for which you are entitled to upload data to</span>}
                        validateStatus={uploadState.structureSelection.projectNumberInput.status}>
                        <Select
                            labelInValue
                            defaultValue={uploadState.structureSelection.projectNumberInput.value}
                            onSelect={(value: string) => {
                                
                                console.log("selected: ", value);
                                
                                uploadDispatch({
                                    type: UploadActionType.Select,
                                    payload: {
                                        ...uploadState,
                                        structureSelection: {
                                            ...uploadState.structureSelection,
                                            projectNumberInput: (value !== "") ?
                                            {
                                                value,
                                                status: "success" as (typeof InputValidationStatuses)[number],
                                                isSelected: true
                                            }:
                                            {
                                                ...(uploadState.structureSelection.projectNumberInput),
                                                status: "error" as (typeof InputValidationStatuses)[number],
                                                isSelected: false
                                            },
                                        } as StructureSelection
                                    } as UploadState
                                } as UploadAction);
                            }}
                            style={selectStyle}
                            disabled={false}>
                            {
                                projectList.map((p) => 
                                    <Option value={p.projectNumber}>
                                        <Text ellipsis>{`${p.projectNumber}: ${p.title}`}</Text>
                                    </Option>
                                )
                            }
                        </Select>
                    </Item>
                </Col>
                <Col span={12}></Col>
            </Row>
            <Row gutter={16}>
                <Col span={12}>
                    <FormInput config={configInputSubjectLabel} />
                </Col>
                <Col span={12}></Col>
            </Row>
            <Row gutter={16}>
                <Col span={12}>
                    <FormInput config={configInputSessionLabel} />
                </Col>
                <Col span={12}></Col>
            </Row>
            <Row gutter={16}>
                <Col span={12}>
                    <FormSelect config={configSelectDataType} />
                </Col>
                <Col span={12}></Col>
            </Row>
            <Row gutter={16}>
                <Col span={12}>
                    <FormInput config={configInputDataTypeOther} />
                </Col>
                <Col span={12}></Col>
            </Row>
        </Form>
    );
};

const StructureSelector = Form.create<StructureSelectorProps & FormComponentProps>()(StructureSelectorForm);
export default StructureSelector;
