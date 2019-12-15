import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route } from 'react-router-dom';

import { Footer, Header, Home } from './pages';

const App: React.FC = () => (
  <React.Fragment>
    <Header />
    <Home />
    <Footer />
  </React.Fragment>
)

ReactDOM.render(
  <BrowserRouter>
    <Route path="*" component={App} />
  </BrowserRouter>,  
  document.getElementById('app')
)
