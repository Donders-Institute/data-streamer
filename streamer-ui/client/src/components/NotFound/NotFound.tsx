import React from "react";
import { Layout, Card } from "antd";

import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import notFound from "../../assets/notfound.jpg";

const { Content } = Layout;

const NotFound: React.FC = () => {
    return (
        <Content style={{ background: "#f0f2f5" }}>
            <Header />
            <div style={{ padding: 10 }}>
                <Card
                    style={{ borderRadius: 4, boxShadow: "1px 1px 1px #ddd" }}
                    className="shadow"
                >
                    <h1>Not Found</h1>
                    <div>
                        <img alt="Not Found" src={notFound} width={300} />
                    </div>
                </Card>
            </div>
            <Footer />
        </Content>
    );
};

export default NotFound;
