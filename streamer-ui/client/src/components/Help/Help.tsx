import React from "react";
import { Layout, Card, BackTop } from "antd";

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
                    <div style={{ zoom: 1, padding: "7px", border: "1px solid", background: "#f8f9fa", font: "95%", width: "25%", marginTop: 20 }}>
                        <div>
                            <h2>Content</h2>
                        </div>
                        <ul>
                            <li>
                                <a href="#quickguide">
                                    Quick guide
                                </a>
                                <ol>
                                    <li>
                                        Select file(s)
                                    </li>
                                    <li>
                                        Select project, subject, session, and data type
                                    </li>
                                    <li>
                                        Upload file(s)
                                    </li>
                                </ol>
                            </li>
                            <li>
                                <a href="#troubleshooting">
                                    Troubleshooting
                                </a>
                            </li>
                        </ul>
                    </div>

                    <h2 style={{ marginTop: 40 }}><a id="quickguide"></a>Quick guide</h2>

                    <h3>1. Select file(s)</h3>
                    <div>
                        <img src={process.env.PUBLIC_URL + "/images/screenshot-quick-guide-01.png"} style={{ width: "50%", border: "1px solid", boxShadow: "8px 8px 8px #ddd" }} />
                    </div>

                    <h3 style={{ marginTop: 20 }}>2. Select project, subject, session, and data type</h3>
                    <div>
                        <img src={process.env.PUBLIC_URL + "/images/screenshot-quick-guide-01.png"} style={{ width: "50%", border: "1px solid", boxShadow: "8px 8px 8px #ddd" }} />
                    </div>

                    <h3 style={{ marginTop: 20 }}>3. Upload file(s)</h3>
                    <div>
                        <img src={process.env.PUBLIC_URL + "/images/screenshot-quick-guide-01.png"} style={{ width: "50%", border: "1px solid", boxShadow: "8px 8px 8px #ddd" }} />
                    </div>

                    <h2 style={{ marginTop: 40 }}><a id="troubleshooting"></a>Troubleshooting</h2>
                    <div>
                        TBD
                    </div>

                    <div>
                        <BackTop />
                    </div>
                </Card>
            </div>
            <Footer />
        </Content>
    );
};

export default Help;
