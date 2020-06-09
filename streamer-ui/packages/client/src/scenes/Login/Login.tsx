import React from "react";

import {
    Card,
    Form,
    Icon,
    Button,
    Input,
    Layout,
    Row,
    Col
} from "antd";

import { FormComponentProps } from "antd/lib/form";

import HeaderLandingPage from "../../components/HeaderLandingPage/HeaderLandingPage";

import ErrorModal from "../../components/ErrorModal/ErrorModal";

import "../../app/App.less";
import logoDCCN from "../../assets/dccn-logo.png";

import { ErrorState } from "../../types/types";

const { Content } = Layout;

interface LoginProps {
    handleChangeUsername: (username: string) => Promise<void>;
    handleChangePassword: (password: string) => Promise<void>;
    handleSignIn: () => Promise<void>;
    enableLoginButton: boolean;
    showAuthErrorModal: boolean;
    handleOkAuthErrorModal: () => Promise<void>;
    authErrorState: ErrorState
}

const LoginForm: React.FC<LoginProps & FormComponentProps> = ({
    handleChangeUsername,
    handleChangePassword,
    handleSignIn,
    enableLoginButton,
    showAuthErrorModal,
    handleOkAuthErrorModal,
    authErrorState,
    form
}) => {

    const { getFieldDecorator } = form;

    const disableLoginButton = !enableLoginButton;

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
                                onSubmit={(event: React.FormEvent<HTMLFormElement>) => {
                                    event.preventDefault();
                                    handleSignIn();
                                }}
                                style={{ margin: "0px 0px 0px 0px" }}
                            >
                                <Form.Item style={{ margin: "0px 0px 0px 0px" }}>
                                    {
                                        getFieldDecorator("username", {
                                            rules: [
                                                {
                                                    required: true,
                                                    message: "Please input your DCCN username"
                                                }
                                            ]
                                        })(
                                            <Input
                                                prefix={<Icon type="user" style={{ color: "rgba(0,0,0,.25)" }} />}
                                                placeholder="User name"
                                                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                                    handleChangeUsername(event.target.value);
                                                }}
                                            />
                                        )
                                    }
                                </Form.Item>
                                <Form.Item style={{ margin: "0px 0px 10px 0px" }}>
                                    {
                                        getFieldDecorator("password", {
                                            rules: [
                                                {
                                                    required: true,
                                                    message: "Please input your password"
                                                }
                                            ]
                                        })(
                                            <Input
                                                prefix={<Icon type="lock" style={{ color: "rgba(0,0,0,.25)" }} />}
                                                type="password"
                                                placeholder="Password"
                                                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                                    handleChangePassword(event.target.value);
                                                }}
                                            />
                                        )
                                    }
                                </Form.Item>
                                <Form.Item style={{ margin: "0px 0px 10px 0px" }}>
                                    <Button
                                        className="login-form-button"
                                        type="primary"
                                        disabled={disableLoginButton}
                                        htmlType="submit"
                                    >
                                        Log in
                                </Button>
                                </Form.Item>
                            </Form>
                        </Card>
                    </Col>
                    <Col span={2}></Col>
                </Row>
            </Content>
            <ErrorModal
                errorState={authErrorState}
                showErrorModal={showAuthErrorModal}
                handleOkErrorModal={handleOkAuthErrorModal}
            />
        </React.Fragment>
    );
};

const Login = Form.create<LoginProps & FormComponentProps>()(LoginForm);

export default Login;
