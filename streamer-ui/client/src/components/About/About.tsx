import React from "react";
import { Layout, Card } from "antd";

import Header from "../Header/Header";
import Footer from "../Footer/Footer";

const { Content } = Layout;

const About: React.FC = () => {
    return (
        <Content style={{ background: "#f0f2f5" }}>
            <Header />
            <div style={{ padding: 10 }}>
                <Card
                    style={{ borderRadius: 4, boxShadow: "1px 1px 1px #ddd" }}
                    className="shadow"
                >
                    <h1>About the Streamer UI</h1>
                    The purpose of the streamer UI is to upload files to the project
                    storage in an enforced folder structure.
                </Card>
            </div>
            <Footer />
        </Content>
    );
};

export default About;
