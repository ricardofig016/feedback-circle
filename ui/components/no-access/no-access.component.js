"use strict";

import BaseComponent from "../base/base.component.js";

export default class NoAccessComponent extends BaseComponent {
  selector = "no-access";
  pageTitle = "403";
  pageIcon = "";
  access = ["user", "appraiser", "admin"];
}
