import React from "react";
import { Form, Input } from "antd";

import { FormInputConfig } from "../../types/types";

const { Item } = Form;

interface FormInputProps {
    config: FormInputConfig
}

const FormInput: React.FC<FormInputProps> = ({ config }) => {
    const {
        name,
        value,
        validateStatus,
        label,
        help,
        message,
        validator,
        placeholder,
        handleChange,
        disable,
        show,
        labelStyle,
        helpStyle,
        inputStyle,
        form
    } = config;

    const { getFieldDecorator } = form;

    const inputLabel = <span style={labelStyle}>{label}</span>;
    const inputHelp = <span style={helpStyle}>{help}</span>;

    return (
        <React.Fragment>
            {
                show &&
                <Item
                    hasFeedback
                    label={inputLabel}
                    help={inputHelp}
                    validateStatus={validateStatus}
                >
                    {
                        getFieldDecorator(name,
                            {
                                initialValue: value,
                                rules: [
                                    {
                                        required: true,
                                        message
                                    },
                                    {
                                        validator
                                    }
                                ]
                            })(
                                <Input
                                    placeholder={placeholder}
                                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                        handleChange(event.target.value);
                                    }}
                                    style={inputStyle}
                                    disabled={disable}
                                />
                            )
                    }
                </Item>
            }
        </React.Fragment>
    );
};

export default FormInput;
