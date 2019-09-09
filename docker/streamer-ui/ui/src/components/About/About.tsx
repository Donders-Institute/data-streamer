import React from "react";
import { Layout, Card } from "antd";
const { Content } = Layout;

const About: React.FC = () => {
    return (
        <Content style={{ background: "#f0f2f5" }}>
            <div style={{ padding: 10 }}>
                <Card
                    style={{ borderRadius: 4, boxShadow: "1px 1px 1px #ddd" }}
                    className="shadow"
                >
                    <h1>About the Streamer UI</h1>
          The purpose of the streamer UI is to upload files to the project
          storage in an enforced structure.
                </Card>
            </div>
        </Content>
    );
};

export default About;
