import React from "react";
import { Layout, Card } from "antd";

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
                    <h1>Help</h1>
                    <div>
                        Please find instructions how to use the streamer UI below.
                    </div>
                    <div style={{ zoom: 1, padding: "7px", border: "1px solid", background: "#f8f9fa", font: "95%", width: "11%", marginTop: 20 }}>
                        <div>
                            <h2>Content</h2>
                        </div>
                        <ul>
                            <li>
                                <a href="#quickguide">
                                    <span>Quick guide</span>
                                </a>
                            </li>
                            <li>
                                <a href="#troubleshooting">
                                    <span>Troubleshooting</span>
                                </a>
                            </li>
                        </ul>
                    </div>
                    <h2 style={{ marginTop: 20 }}><a id="quickguide"></a>Quick guide</h2>
                    <div>
                        TBD
                    </div>
                    <h2 style={{ marginTop: 20 }}><a id="troubleshooting"></a>Troubleshooting</h2>
                    <div>
                        TBD
                    </div>
                </Card>
            </div>
            <Footer />
        </Content>
    );
};

export default Help;
