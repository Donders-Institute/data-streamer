import React from "react";
import { Redirect } from "react-router-dom";
import { Layout } from "antd";

const { Content } = Layout;

const Logout: React.FC = () => {
    return (
        <Content style={{ background: "#f0f2f5", marginTop: "10px" }}>
            <Redirect to="/login" />
        </Content>
    );
};

export default Logout;
