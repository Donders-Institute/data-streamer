import React from 'react';
import { Layout, Card } from 'antd';
const { Content } = Layout;

class About extends React.Component {
  render() {
    return (
      <Content style={{ background: '#f0f2f5' }}>
        <div style={{ padding: 10 }}>
          <Card
            style={{ borderRadius: 4, boxShadow: '1px 1px 1px #ddd' }}
            className="shadow"
          >
            <h1>About the Lab Streamer UI</h1>
            The purpose of the lab streamer UI is to upload files to the project storage  in an enforced structure.
          </Card>
        </div>
      </Content>
    );
  }
}

export default About;
