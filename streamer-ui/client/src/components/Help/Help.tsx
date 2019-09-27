import React from "react";
import { Link } from "react-router-dom";
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
                        Please find instructions below how to use the streamer UI.
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
                                        <a href="#quickguidelogin">
                                            Login
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#quickguideselectfiles">
                                            Select file(s)
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#quickguideselectstructure">
                                            Select project, subject, session, and data type
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#quickguideuploadfiles">
                                            Upload file(s)
                                        </a>
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

                    <h2 id="quickguide" style={{ marginTop: 40 }}>Quick guide</h2>

                    <h3 id="quickguidelogin">1. Login</h3>
                    <div style={{ marginTop: 20 }}>
                        Login with your DCCN credentials.
                    </div>
                    <div style={{ marginTop: 20 }}>
                        <img src={process.env.PUBLIC_URL + "/images/quick-guide-screenshot-00-login.png"} style={{ width: "50%", border: "1px solid", boxShadow: "8px 8px 8px #ddd" }} />
                    </div>

                    <h3 id="quickguideselectfiles" style={{ marginTop: 20 }}>2. Select file(s)</h3>
                    <div style={{ marginTop: 20 }}>
                        Select one or more files.
                    </div>
                    <div style={{ marginTop: 20 }}>
                        <img src={process.env.PUBLIC_URL + "/images/quick-guide-screenshot-01-uploader-start.png"} style={{ width: "50%", border: "1px solid", boxShadow: "8px 8px 8px #ddd" }} />
                    </div>
                    <div style={{ marginTop: 20 }}>
                        <img src={process.env.PUBLIC_URL + "/images/quick-guide-screenshot-02-uploader-select-files.png"} style={{ width: "50%", border: "1px solid", boxShadow: "8px 8px 8px #ddd" }} />
                    </div>

                    <h3 id="quickguideselectstructure" style={{ marginTop: 20 }}>3. Select project number, subject, session, and data type</h3>
                    <div style={{ marginTop: 20 }}>
                        Select project number, subject, session, and data type.
                    </div>
                    <div style={{ marginTop: 20 }}>
                        <img src={process.env.PUBLIC_URL + "/images/quick-guide-screenshot-03-uploader-select-structure.png"} style={{ width: "50%", border: "1px solid", boxShadow: "8px 8px 8px #ddd" }} />
                    </div>

                    <h3 id="quickguideuploadfiles" style={{ marginTop: 20 }}>4. Upload file(s)</h3>
                    <div style={{ marginTop: 20 }}>
                        Press the upload button.
                    </div>
                    <div style={{ marginTop: 20 }}>
                        <img src={process.env.PUBLIC_URL + "/images/quick-guide-screenshot-04-uploader-progress.png"} style={{ width: "50%", border: "1px solid", boxShadow: "8px 8px 8px #ddd" }} />
                    </div>
                    <div style={{ marginTop: 20 }}>
                        Upload another batch of files or log out when you are done.
                    </div>

                    <h2 id="troubleshooting" style={{ marginTop: 40 }}>Troubleshooting</h2>
                    <div style={{ marginTop: 20 }}>
                        Please <Link to="/contact">contact</Link> one of the adminstrators when encountering any issues.
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
