import React from "react";
import { shallow } from "enzyme";
import toJson from "enzyme-to-json";

import TargetPath from "../components/Uploader/TargetPath";

describe("<TargetPath />", () => {
    it("renders initial targetpath component", () => {
        const props = {
            isSelectedProject: false,
            projectNumber: "",
            isSelectedSubject: false,
            subjectLabel: "",
            isSelectedSession: false,
            isSelectedDataType: false,
            dataType: "",
            sessionLabel: ""
        };
        const wrapper = shallow(<TargetPath {...props} />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("renders targetpath component with project selected", () => {
        const props = {
            isSelectedProject: true,
            projectNumber: "12345678.01",
            isSelectedSubject: false,
            subjectLabel: "",
            isSelectedSession: false,
            sessionLabel: "",
            isSelectedDataType: false,
            dataType: ""
        };
        const wrapper = shallow(<TargetPath {...props} />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("renders targetpath component with subject selected", () => {
        const props = {
            isSelectedProject: true,
            projectNumber: "12345678.01",
            isSelectedSubject: true,
            subjectLabel: "1",
            isSelectedSession: false,
            sessionLabel: "",
            isSelectedDataType: false,
            dataType: ""
        };
        const wrapper = shallow(<TargetPath {...props} />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("renders targetpath component with session selected", () => {
        const props = {
            isSelectedProject: true,
            projectNumber: "12345678.01",
            isSelectedSubject: true,
            subjectLabel: "1",
            isSelectedSession: true,
            sessionLabel: "2",
            isSelectedDataType: false,
            dataType: ""
        };
        const wrapper = shallow(<TargetPath {...props} />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("renders targetpath component with data type other", () => {
        const props = {
            isSelectedProject: true,
            projectNumber: "12345678.01",
            isSelectedSubject: true,
            subjectLabel: "1",
            isSelectedSession: true,
            sessionLabel: "2",
            isSelectedDataType: true,
            dataType: "other"
        };
        const wrapper = shallow(<TargetPath {...props} />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("renders targetpath component with data type", () => {
        const props = {
            isSelectedProject: true,
            projectNumber: "12345678.01",
            isSelectedSubject: true,
            subjectLabel: "1",
            isSelectedSession: true,
            sessionLabel: "2",
            isSelectedDataType: true,
            dataType: "mri"
        };
        const wrapper = shallow(<TargetPath {...props} />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });
});