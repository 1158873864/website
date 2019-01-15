import { Route } from "react-router";
import React from 'react';

export interface RouteConfig {
  path: string;
  exact: boolean;
  component: any
}

export function constructRoute(config: RouteConfig) {
  return <Route exact={config.exact} key={config.path} path={config.path} component={config.component}/>;
}
