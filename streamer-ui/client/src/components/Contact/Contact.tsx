import React from "react";
import { Layout, Card, Icon } from "antd";

import Header from "../Header/Header";
import Footer from "../Footer/Footer";

const { Content } = Layout;

const Contact: React.FC = () => {
    return (
        <Content style={{ background: "#f0f2f5" }}>
            <Header />
            <div style={{ padding: 10 }}>
                <Card
                    style={{ borderRadius: 4, boxShadow: "1px 1px 1px #ddd", marginTop: 10 }}
                    className="shadow"
                >
                    <h1>Contact</h1>
                    <div>
                        If you encounter any issues, please send an email to the helpdesk:
                    </div>
                    <div>
                        <a href={"mailto:helpdesk@fcdonders.ru.nl"}>
                            <Icon type="mail" style={{ marginRight: "4px" }} />
                            helpdesk@fcdonders.ru.nl
                        </a>
                    </div>
                </Card>
            </div>
            <Footer />
        </Content>
    );
};

export default Contact;
