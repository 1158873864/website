import React from "react";
import { RouteConfig } from "../../router/RouteConfig";

export const homePage: RouteConfig = {
  exact: false,
  path: "/",
  component: import("../HomePage")
};
export const foodPage: RouteConfig = {
  exact: false,
  path: "/food",
  component: import("../FoodPage")
};

export default [
  homePage,
  foodPage
]
