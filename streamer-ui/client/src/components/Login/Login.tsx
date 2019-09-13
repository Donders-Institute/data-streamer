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
    Tooltip
} from "antd";
import { FormComponentProps } from "antd/lib/form";

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
};

class LoginForm extends React.Component<IProps & FormComponentProps, LoginState> {
    constructor(props: IProps & FormComponentProps) {
        super(props);

        // reset login status
        Auth.signout();

        this.state = {
            username: "",
            password: "",
            submitted: false
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(e: any) {
        // const { name, value } = e.target;
        // this.setState({} => { [name]: value });
        console.log(e);
    }

    handleSubmit(e: any) {
        e.preventDefault();
        this.setState(({ submitted }) => ({
            submitted: true
        }));
        // const { username, password } = this.state;
        // if (username && password) {
        //     Auth.authenticate(); // (username, password);
        // }
        Auth.authenticate();
    }

    render() {
        const { getFieldDecorator } = this.props.form;
        // const { loggingIn } = this.props;
        // const { username, password, submitted } = this.state;
        return (
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
                                        rules: [{ required: true, message: "Please input your username" }]
                                    })(
                                        <Input
                                            prefix={<Icon type="user" style={{ color: "rgba(0,0,0,.25)" }} />}
                                            placeholder="DCCN Username"
                                        />,
                                    )}
                                </Form.Item>
                                <Form.Item>
                                    {getFieldDecorator("password", {
                                        rules: [{ required: true, message: "Please input your Password" }]
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
        );
    }
}

const Login = Form.create<IProps & FormComponentProps>()(LoginForm);

export default Login;
