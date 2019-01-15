import React from "react";
import { BaseLayout } from "../../layouts/BaseLayout";
import { Switch } from "react-router";
import rootRoutes from "./rootRoutes";
import { constructRoute } from "../../router/RouteConfig";

interface Props {

}

export class BaseLayoutPage extends React.Component<Props, any> {
  render() {
    return <BaseLayout>
      <Switch>
        {rootRoutes.map(constructRoute)}
      </Switch>
    </BaseLayout>;
  }
}
