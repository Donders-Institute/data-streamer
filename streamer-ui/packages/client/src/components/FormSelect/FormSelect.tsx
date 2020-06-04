import React from "react";
import { Form, Select } from "antd";

import {
    FormSelectConfig, SelectOption
} from "../../types/types";

const { Item } = Form;
const { Option } = Select;

interface FormSelectProps {
    config: FormSelectConfig
};

const FormSelect: React.FC<FormSelectProps> = ({ config }) => {
    const {
        options,
        option, // Currently selected
        optionNotSelected, // Display value when no selection has taken place yet
        validateStatus,
        label,
        help,
        handleSelect,
        disable,
        show,
        labelStyle,
        helpStyle,
        selectStyle
    } = config;

    const selectLabel = <span style={labelStyle}>{label}</span>;
    const selectHelp = <span style={helpStyle}>{help}</span>;

    // Currently selected option
    const selected = option === "" ? optionNotSelected : option;
    const selectedOption = {
        key: selected
    } as SelectOption;

    const selectOptions = options.map((element, index) => (
        <Option key={index} value={element}>{element}</Option>
    ));

    return (
        <React.Fragment>
            {
                show &&
                <Item
                    hasFeedback
                    label={selectLabel}
                    help={selectHelp}
                    validateStatus={validateStatus}
                >
                    <Select
                        labelInValue
                        defaultValue={selectedOption}
                        onSelect={(value: SelectOption) => {
                            handleSelect(value.key);
                        }}
                        style={selectStyle}
                        disabled={disable}
                    >
                        {selectOptions}
                    </Select>
                </Item>
            }
        </React.Fragment>
    );
};

export default FormSelect;
