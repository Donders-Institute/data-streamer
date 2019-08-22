import React from 'react';
import { Layout, Card, Icon } from 'antd';
const { Content } = Layout;

class Glossary extends React.Component {
  render() {
    return (
      <Content style={{ background: '#f0f2f5' }}>
        <div style={{ padding: 10 }}>
          <Card
            style={{ borderRadius: 4, boxShadow: '1px 1px 1px #ddd' }}
            className="shadow"
          >
            <h2 id="top">Glossary</h2>
            <div>
              Data streamer concepts are listed below, in alphabetical order:
            </div>

            <br />
            <div>
              <ul>
                <li><a href="#lab-streamer">Lab Streamer</a></li>
                <li><a href="#ui">UI</a></li>
              </ul>
            </div>

            <h2 id="lab-stremer">Lab Streamer</h2>
            <div>
              TBD
            </div>
            <div>
              <a href="#top"><Icon type="up-square" /></a>
            </div>

            <br />
            <h2 id="ui">UI</h2>
            <div>
              User Interface. TBD
            </div>
            <div>
              <a href="#top"><Icon type="up-square" /></a>
            </div>

          </Card>
        </div>
      </Content>
    );
  }
}

export default Glossary;
