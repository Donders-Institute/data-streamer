import React, { useState, useContext } from "react";
import {
    Card,
    Form,
    Icon,
    Button,
    Input,
    Layout,
    Row,
    Col,
    Spin,
    Modal
} from "antd";
import { FormComponentProps } from "antd/lib/form";
import { Redirect } from "react-router-dom";

import { AuthContext, IAuthContext } from "../../services/auth/AuthContext";
import { fetchOnce, basicAuthString } from "../../services/fetch/fetch";

import HeaderLogin from "../../components/HeaderLogin/HeaderLogin";

import "../../App.less";
import logoDCCN from "../../assets/dccn-logo.png";
import { LoginResponse } from "../../types/types";

const { Content } = Layout;

function modalError(msg: string) {
    Modal.error({
        title: "Error",
        content: msg,
        onOk() {
            Modal.destroyAll();
        }
    });
}

const LoginForm: React.FC<FormComponentProps> = ({ form }) => {
    const authContext: IAuthContext | null = useContext(AuthContext);

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [ipAddress, setIpAddress] = useState("0.0.0.0");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loggingIn, setLoggingIn] = useState(false);
    const [hasSubmitted, setHasSubmitted] = useState(false);

    const { getFieldDecorator } = form;
    const antIcon = <Icon type="loading" style={{ fontSize: 24, margin: 10 }} spin />;

    const handleLogin = async (username: string, password: string) => {
        let headers = new Headers(
            {
                'Content-Type': 'application/json',
                'Authorization': basicAuthString({ username, password })
            }
        );
        let body = JSON.stringify({ username, password })

        let result: LoginResponse;
        try {
            result = await fetchOnce<LoginResponse>({
                url: "/login",
                options: {
                    method: 'POST',
                    credentials: 'include',
                    headers,
                    body
                } as RequestInit,
                timeout: 2000
            });
        }
        catch (error) {
            console.error(error);
            setIsAuthenticated(() => false);
            setLoggingIn(() => false);
            setHasSubmitted(() => false);
            modalError(error);
            return;
        }

        // Check result for errors
        if (!result.success || result.error) {
            const errorMessage = result.error as string;
            console.error('Login failure');
            console.error(errorMessage);
            setIsAuthenticated(() => false);
            setLoggingIn(() => false);
            setHasSubmitted(() => false);
            modalError(errorMessage);
            return;
        }

        console.log('Successfully logged in');
        setIsAuthenticated(() => true);
        setLoggingIn(() => false);
        setHasSubmitted(() => false);
        setUsername(() => username);
        setPassword(() => password);
        setIpAddress(() => ipAddress);
        authContext!.signIn(username, password, ipAddress);
    };

    const handleSubmit = (event: any) => {
        event.preventDefault();
        setUsername(() => username);
        setPassword(() => password);
        setIsAuthenticated(() => false);
        setLoggingIn(() => true);
        setHasSubmitted(() => true);
        handleLogin(username, password);
    };

    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newUsername = e.target.value;
        setUsername(newUsername);
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPassword = e.target.value;
        setPassword(newPassword);
    };

    return (
        <div>
            {/* {
                !authContext!.isAuthenticated &&
                <Button
                    onClick={() => authContext!.signIn("rutvdee", "testpassword", "0.0.0.0")}>
                    Authenticate rutvdee
                </Button>
            } */}
            {
                isAuthenticated &&
                <Redirect to="/" />
            }
            {
                authContext!.isAuthenticated &&
                <Redirect to="/" />
            }
            {
                loggingIn && hasSubmitted && !isAuthenticated &&
                <Content style={{ background: "#f0f2f5", marginTop: "10px" }}>
                    <Spin indicator={antIcon} />
                </Content>
            }
            {
                !loggingIn && !hasSubmitted && !isAuthenticated &&
                <Content>
                    <HeaderLogin />
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
                                    <Form className="login-form" onSubmit={handleSubmit} style={{ margin: "0px 0px 0px 0px" }}>
                                        <Form.Item style={{ margin: "0px 0px 0px 0px" }}>
                                            {getFieldDecorator("username", {
                                                rules: [{ required: true, message: "Please input your DCCN username" }]
                                            })(
                                                <Input
                                                    prefix={<Icon type="user" style={{ color: "rgba(0,0,0,.25)" }} />}
                                                    placeholder="User name"
                                                    onChange={handleUsernameChange}
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
                                                    onChange={handlePasswordChange}
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
                </Content>
            }
        </div>
    );
};

const Login = Form.create<FormComponentProps>()(LoginForm);

export default Login;
