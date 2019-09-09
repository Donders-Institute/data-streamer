import * as React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { Layout } from "antd";

import Header from "./Header/Header";
import Footer from "./Footer/Footer";
import About from "./About/About";
import Contact from "./Contact/Contact";
import Uploader from "./Uploader/Uploader";
import NotFound from "./NotFound/NotFound";

import "../App.less";

class App extends React.Component {
  render() {
    return (
      <Router>
        <Layout>
          <Header />
          <Layout.Content>
            <Layout>
              <Switch>
                <Route exact path="/" component={Uploader} />
                <Route path="/about" component={About} />
                <Route path="/contact" component={Contact} />
                <Route component={NotFound} />
              </Switch>
            </Layout>
          </Layout.Content>
          <Footer />
        </Layout>
      </Router>
    );
  }
}

export default App;
