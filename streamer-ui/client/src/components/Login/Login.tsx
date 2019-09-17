import React from "react";
import {
    Card,
    Form,
    Icon,
    Button,
    Input,
    Layout,
    Row,
    Col,
    Tooltip,
    Spin
} from "antd";
import { FormComponentProps } from "antd/lib/form";
import { Redirect } from "react-router-dom";

import Auth from "../Auth/Auth";
import "../../App.less";
import logoDCCN from "../../assets/dccn-logo.png";

const { Content } = Layout;

interface IProps {
    title?: string | undefined;
}

type LoginState = {
    username: string;
    password: string;
    submitted: boolean;
    loggingIn: boolean;
};

const login = (username: string, password: string) => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(Auth.authenticate(username, password));
        }, 2000);
    });
};

class LoginForm extends React.Component<IProps & FormComponentProps, LoginState> {
    constructor(props: IProps & FormComponentProps) {
        super(props);

        // Reset login status
        Auth.signout();

        this.state = {
            username: "",
            password: "",
            submitted: false,
            loggingIn: false
        };

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(e: any) {
        e.preventDefault();
        this.props.form.validateFields(async (err, values) => {
            if (!err) {
                // Set state to loggingIn
                this.setState(({ submitted, loggingIn }) => ({
                    submitted: true,
                    loggingIn: true
                }));

                let username = values.username;
                let password = values.password;
                try {
                    const res = await login(username, password);
                    // let data = await res.json();
                    // console.log(data);
                    console.log(res);

                    // Done, logged in
                    this.setState(({ submitted, loggingIn }) => ({
                        username: username,
                        password: password,
                        submitted: true,
                        loggingIn: false
                    }));
                } catch (err) {
                    console.log(err);
                }
            }
        });
    }

    render() {
        const antIcon = <Icon type="loading" style={{ fontSize: 24, margin: 10 }} spin />;
        const { getFieldDecorator } = this.props.form;
        return (
            <div>
                {
                    !this.state.loggingIn &&
                    <Content style={{ background: "#f0f2f5", marginTop: "10px" }}>
                        <Row justify="center" style={{ height: "100%" }}>
                            <Col span={10}>
                            </Col>
                            <Col span={4}>
                                <Card
                                    style={{
                                        borderRadius: 4,
                                        boxShadow: "1px 1px 1px #ddd",
                                        marginTop: 10
                                    }}
                                    className="shadow"
                                >
                                    <div style={{ display: "flex", justifyContent: "center", marginBottom: 30 }}>
                                        <img alt="Donders Institute" src={logoDCCN} height={64} />
                                    </div>
                                    <Form onSubmit={this.handleSubmit} className="login-form">
                                        <Form.Item>
                                            {getFieldDecorator("username", {
                                                rules: [{ required: true, message: "Please input your DCCN username" }]
                                            })(
                                                <Input
                                                    prefix={<Icon type="user" style={{ color: "rgba(0,0,0,.25)" }} />}
                                                    placeholder="DCCN Username"
                                                />,
                                            )}
                                        </Form.Item>
                                        <Form.Item>
                                            {getFieldDecorator("password", {
                                                rules: [{ required: true, message: "Please input your password" }]
                                            })(
                                                <Input
                                                    prefix={<Icon type="lock" style={{ color: "rgba(0,0,0,.25)" }} />}
                                                    type="password"
                                                    placeholder="Password"
                                                />,
                                            )}
                                        </Form.Item>
                                        <Form.Item>
                                            <Button type="primary" htmlType="submit" className="login-form-button">
                                                Log in
                                            </Button>
                                        </Form.Item>
                                        <div style={{ display: "flex", justifyContent: "center" }}>
                                            <Tooltip title="This is the login page for the data streamer UI">
                                                <Icon type="question-circle" />
                                            </Tooltip>
                                        </div>
                                    </Form>
                                </Card>
                            </Col>
                            <Col span={10}>
                            </Col>
                        </Row>
                    </Content>
                }
                {
                    this.state.loggingIn &&
                    <Content style={{ background: "#f0f2f5", marginTop: "10px" }}>
                        <Spin indicator={antIcon} />
                    </Content>
                }
                {
                    this.state.submitted && !this.state.loggingIn &&
                    <Content style={{ background: "#f0f2f5", marginTop: "10px" }}>
                        <Redirect to="/" />
                    </Content>
                }
            </div >
        );
    }
}

const Login = Form.create<IProps & FormComponentProps>()(LoginForm);

export default Login;
