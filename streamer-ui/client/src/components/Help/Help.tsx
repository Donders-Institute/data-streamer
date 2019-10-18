import React from "react";
import { Layout, Card, Icon } from "antd";

import Header from "../Header/Header";
import Footer from "../Footer/Footer";

const { Content } = Layout;

const Help: React.FC = () => {
    return (
        <Content style={{ background: "#f0f2f5" }}>
            <Header />
            <div style={{ padding: 10 }}>
                <Card
                    style={{ borderRadius: 4, boxShadow: "1px 1px 1px #ddd", marginTop: 10 }}
                    className="shadow"
                >
                    <h2>About the streamer UI</h2>
                    <div>
                        The purpose of the streamer UI is to upload files to the project
                        storage in an enforced folder structure.
                    </div>

                    <br />
                    <h2>Instructions</h2>
                    <div>
                        Please find instructions on the intranet:
                    </div>
                    <div>
                        <a href="https://intranet.donders.ru.nl/index.php?id=streamer"><Icon type="link" style={{ marginRight: "4px" }} />https://intranet.donders.ru.nl/index.php?id=streamer</a>
                    </div>

                    <br />
                    <h2>Contact</h2>
                    <div>
                        If you encounter any issues, please contact the data steward:
                    </div>
                    <div>
                        <a href={"mailto:datasupport@donders.ru.nl."}>
                            <Icon type="mail" style={{ marginRight: "4px" }} />
                            datasupport@donders.ru.nl
                        </a>
                    </div>
                </Card>
            </div>
            <Footer />
        </Content>
    );
};

export default Help;
