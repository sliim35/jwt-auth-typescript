import React from 'react';
import { Switch, Route } from 'react-router-dom';

import { Home } from './pages/home';

const Routes = () => {
  return (
    <Switch>
      <Route exact path='/' component={Home} />
    </Switch>
  );
};
