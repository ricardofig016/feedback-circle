"use strict";

import BaseComponent from "../base/base.component.js";

export default class NotFoundComponent extends BaseComponent {
  selector = "not-found";
  pageTitle = "404";
  pageIcon = "";
  access = ["user", "appraiser", "manager", "admin"];
}
