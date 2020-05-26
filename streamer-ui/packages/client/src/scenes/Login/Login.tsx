import React, { useState } from "react";

import {
    Card,
    Form,
    Icon,
    Button,
    Input,
    Layout,
    Row,
    Col,
    Modal
} from "antd";

import { FormComponentProps } from "antd/lib/form";

import HeaderLandingPage from "../../components/HeaderLandingPage/HeaderLandingPage";
import { UserProfile, ServerResponse } from "../../types/types";

import "../../app/App.less";
import logoDCCN from "../../assets/dccn-logo.png";

const { Content } = Layout;

function modalError(errorMessage: string) {
    Modal.error({
        title: "Error",
        content: errorMessage,
        onOk() {
            Modal.destroyAll();
        }
    });
}

interface LoginProps {
    userProfile: UserProfile;
    signIn: (username: string, password: string) => Promise<ServerResponse>;
}

const LoginForm: React.FC<LoginProps & FormComponentProps> = ({ userProfile, signIn, form }) => {

    const [username, setUsername] = useState(userProfile.username);
    const [password, setPassword] = useState(userProfile.password);

    const { getFieldDecorator } = form;

    async function handleLogin(username: string, password: string) {
        let result: ServerResponse;
        try {
            result = await signIn(username, password);
        } catch (err) {
            console.error('Login failure');
            console.error(err);
            modalError(err.message);
            return; // Abort
        }

        // Double check result for errors
        if (result.error) {
            console.error('Login failure');
            const errorMessage = result.error as string;
            console.error(errorMessage);
            modalError(errorMessage);
            return; // Abort
        }

        console.log('Successfully logged in');
        setUsername(username);
        setPassword(password);
    };

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        handleLogin(username, password);
    };

    return (
        <React.Fragment>
            <HeaderLandingPage />
            <Content className="Login">
                <Row type="flex" justify="center" align="middle" style={{ width: "100%" }}>
                    <Col span={2}></Col>
                    <Col span={20}>
                        <Card className="LoginCard">
                            <div style={{ display: "flex", justifyContent: "center", margin: "0px 0px 20px 0px" }}>
                                <img alt="Donders Institute" src={logoDCCN} height={64} />
                            </div>
                            <h2 style={{ display: "flex", justifyContent: "center", margin: "0px 0px 10px 0px" }}>
                                Research Data Uploader
                        </h2>
                            <p>Its purpose is to upload files from
                            a PC to 1) your project folder on central storage and
                            2) to the Donders Repository.
                        The destination follows a standardized folder structure.</p>
                            <h1 style={{ display: "flex", justifyContent: "center", margin: "0px 0px 20px 0px" }}>
                                Please login
                        </h1>
                            <div style={{ fontSize: "small", margin: "0px 0px 0px 0px" }}>
                                Enter your DCCN credentials
                        </div>
                            <Form
                                className="login-form"
                                onSubmit={(event: React.FormEvent<HTMLFormElement>) => { handleSubmit(event); }}
                                style={{ margin: "0px 0px 0px 0px" }}
                            >
                                <Form.Item style={{ margin: "0px 0px 0px 0px" }}>
                                    {getFieldDecorator("username", {
                                        rules: [{ required: true, message: "Please input your DCCN username" }]
                                    })(
                                        <Input
                                            prefix={<Icon type="user" style={{ color: "rgba(0,0,0,.25)" }} />}
                                            placeholder="User name"
                                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                                setUsername(event.target.value);
                                            }}
                                        />,
                                    )}
                                </Form.Item>
                                <Form.Item style={{ margin: "0px 0px 10px 0px" }}>
                                    {getFieldDecorator("password", {
                                        rules: [{ required: true, message: "Please input your password" }]
                                    })(
                                        <Input
                                            prefix={<Icon type="lock" style={{ color: "rgba(0,0,0,.25)" }} />}
                                            type="password"
                                            placeholder="Password"
                                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                                setPassword(event.target.value);
                                            }}
                                        />,
                                    )}
                                </Form.Item>
                                <Form.Item style={{ margin: "0px 0px 10px 0px" }}>
                                    <Button className="login-form-button" type="primary" htmlType="submit">
                                        Log in
                                </Button>
                                </Form.Item>
                            </Form>
                        </Card>
                    </Col>
                    <Col span={2}></Col>
                </Row>
            </Content>
        </React.Fragment>
    );
};

const Login = Form.create<LoginProps & FormComponentProps>()(LoginForm);
export default Login;
