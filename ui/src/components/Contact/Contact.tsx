import React from 'react';
import { Avatar, List, Layout, Card } from 'antd';
const { Content } = Layout;

const data = [
  {
    avatar: <Avatar src={process.env.PUBLIC_URL + '/images/honglee.jpg'} />,
    title: 'Hong Lee',
    description: 'h.lee@donders.ru.nl'
  },
  {
    avatar: <Avatar src={process.env.PUBLIC_URL + '/images/rutgervandeelen.jpg'} />,
    title: 'Rutger van Deelen',
    description: 'R.vanDeelen@donders.ru.nl'
  }
];

class About extends React.Component {
  render() {
    return (
      <Content style={{ background: '#f0f2f5' }}>
        <div style={{ padding: 10 }}>
          <Card
            style={{ borderRadius: 4, boxShadow: '1px 1px 1px #ddd' }}
            className="shadow"
          >
            <h1>Contact</h1>
            Administrators:
          <List
              itemLayout="horizontal"
              dataSource={data}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <div>{item.avatar}</div>
                    }
                    title={item.title}
                    description={
                      <a href={'mailto:' + item.description}>
                        {item.description}
                      </a>
                    }
                  />
                </List.Item>
              )} />
          </Card>
        </div>
      </Content>
    );
  }
}

export default About;
