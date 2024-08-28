"use strict";

import BaseComponent from "../base/base.component.js";

export default class HomeComponent extends BaseComponent {
  selector = "home";
  pageTitle = "Home";
  pageIcon = "fa-home";
  access = ["user", "appraiser", "manager", "admin"];

  onInit() {
    super.onInit();
  }
}
