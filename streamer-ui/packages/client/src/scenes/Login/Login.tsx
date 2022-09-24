import React, { useContext, useState } from "react";

import {
    Card,
    Form,
    Icon,
    Button,
    Input,
    Layout,
    Row,
    Col,
    message
} from "antd";

import { FormComponentProps } from "antd/lib/form";

import "../../app/App.less";
import logoDCCN from "../../assets/dccn-logo.png";

import { AuthActionType, AuthStatus } from "../../types/types";
import { signIn } from "../../services/auth/auth";
import { AuthContext } from "../../services/auth/authContext";
import Header from "../../components/Header/Header";

const { Content } = Layout;

const LoginForm: React.FC<FormComponentProps> = ({form}) => {

    const { getFieldDecorator } = form;

    const [enableLoginButton, showLoginButton] = useState(false);
    const [isLoggingIn, setLoggingIn] = useState(false);

    const {state: authState, updateState: updateAuthState} = useContext(AuthContext);

    return (
        <React.Fragment>
            <Header />
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
                                style={{ margin: "0px 0px 0px 0px" }}
                                onSubmit={(event: React.FormEvent<HTMLFormElement>) => {
                                    event.preventDefault();
                                    form.validateFields((err, values) => {
                                        if (!err) {
                                            const aborter = new AbortController();

                                            setLoggingIn(true);

                                            signIn({
                                                username: values.username,
                                                password: values.password,
                                                signal: aborter.signal,
                                            }).then( _ => {
                                                updateAuthState && updateAuthState({
                                                    type: AuthActionType.SignedIn,
                                                    payload: {
                                                        ...authState,
                                                        isAuthenticated: true,
                                                        status: AuthStatus.LoggedIn,
                                                        userProfile: {
                                                            username: values.username,
                                                            displayName: null,           // TODO: should find a way to retrieve user's displayName
                                                            password: values.password,   // TODO: should not catch password in memory!!
                                                            isAuthenticated: true
                                                        }
                                                    }
                                                });
                                            }).catch( err => {
                                                message.error({
                                                    content: `login failure: ${JSON.stringify(err)}`
                                                });
                                            }).finally(() => {
                                                setLoggingIn(false);
                                                aborter.abort();
                                            });
                                        }
                                    })
                                }}>
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
                                                    showLoginButton( event.target.value && form.getFieldValue("password") );
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
                                                    showLoginButton( event.target.value && form.getFieldValue("username") );
                                                }}
                                            />
                                        )
                                    }
                                </Form.Item>
                                <Form.Item style={{ margin: "0px 0px 10px 0px" }}>
                                    <Button
                                        className="login-form-button"
                                        type="primary"
                                        disabled={ ! enableLoginButton }
                                        loading={ isLoggingIn }
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
        </React.Fragment>
    );
};

const Login = Form.create<FormComponentProps>()(LoginForm);

export default Login;
