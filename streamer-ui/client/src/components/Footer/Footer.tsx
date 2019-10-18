import React from "react";
import { Layout, Row, Col } from "antd";

import "../../App.less";

const Footer: React.FC = () => {
    return (
        <Layout.Footer style={{ padding: "20px 0px 20px 20px" }}>
            <Row type="flex" align-content="flex-end">
                <Col>
                </Col>
            </Row>
        </Layout.Footer>
    );
};

export default Footer;
