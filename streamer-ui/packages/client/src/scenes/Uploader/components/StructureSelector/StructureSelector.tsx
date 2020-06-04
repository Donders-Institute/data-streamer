import React, { useEffect, Dispatch } from "react";

import { Row, Col, Form } from "antd";
import { FormComponentProps } from "antd/lib/form";

import {
    Project,
    UploadState,
    UploadAction,
    FormSelectConfig,
    FormInputConfig
} from "../../../../types/types";

import configureSelectProject from "../../../../services/configureFormFields/configureSelectProject";
import configureInputSubjectLabel from "../../../../services/configureFormFields/configureInputSubjectLabel";
import configureInputSessionLabel from "../../../../services/configureFormFields/configureInputSessionLabel";
import configureSelectDataType from "../../../../services/configureFormFields/configureSelectDataType";
import configureInputDataTypeOther from "../../../../services/configureFormFields/configureInputDataTypeOther";

import FormSelect from "../../../../components/FormSelect/FormSelect";
import FormInput from "../../../../components/FormInput/FormInput";

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

    let configSelectProject: FormSelectConfig;
    let configInputSubjectLabel: FormInputConfig;
    let configInputSessionLabel: FormInputConfig;
    let configSelectDataType: FormSelectConfig;
    let configInputDataTypeOther: FormInputConfig;

    configSelectProject = configureSelectProject({
        projectList,
        selectStyle,
        labelStyle,
        helpStyle,
        uploadState,
        uploadDispatch
    });

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
                    <FormSelect config={configSelectProject} />
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
