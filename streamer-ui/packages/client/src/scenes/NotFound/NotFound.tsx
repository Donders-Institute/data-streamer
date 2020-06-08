import React from "react";
import { Layout, Card } from "antd";

import Header from "../../components/Header/Header";
import { UserProfile, ServerResponse } from "../../types/types";

import "../../app/App.less";

const { Content } = Layout;

interface NotFoundProps {
    userProfile: UserProfile;
    handleSignOut: () => Promise<void>;
}

const NotFound: React.FC<NotFoundProps> = ({ userProfile, handleSignOut }) => {
    return (
        <Content style={{ background: "#f0f2f5" }}>
            <Header userProfile={userProfile} handleSignOut={handleSignOut} />
            <div style={{ padding: 10 }}>
                <Card
                    style={{ borderRadius: 4, boxShadow: "1px 1px 1px #ddd", marginTop: 10 }}
                    className="shadow"
                >
                    <h2>Not found</h2>
                </Card>
            </div>
        </Content>
    );
};

export default NotFound;
