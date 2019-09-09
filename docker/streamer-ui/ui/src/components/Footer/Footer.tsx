import * as React from "react";
import { Link } from "react-router-dom";
import { Layout, Row, Col } from "antd";

import "../../App.less";

class Footer extends React.Component {
  render() {
    return (
      <Layout.Footer style={{ padding: "20px 0px 20px 20px" }}>
        <Row type="flex" align-content="flex-end">
          <Col>
            <div>
              <Link to="/about/">About the Streamer UI</Link>
            </div>
            <div>
              <Link to="/contact/">Contact</Link>
            </div>
          </Col>
        </Row>
      </Layout.Footer>
    );
  }
}

export default Footer;
