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
                    <h2>About the data streamer</h2>
                    <div>
                        The purpose of the data streamer is to upload files to the DCCN project
                        storage. The source files are files from your experiments on this computer.
                        The destination is the correct folder on the DCCN project storage.
                    </div>
                    <div>
                        Once the files have been uploaded to the streamer, the streamer will queue a streamer job.
                        An e-mail will be send to you if the job has been successful or not.
                    </div>

                    <br />
                    <h2>How to</h2>
                    <div>
                        Please find more information on how to use the data streamer on the Intranet:
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
