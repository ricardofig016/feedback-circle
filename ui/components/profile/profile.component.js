"use strict";

import BaseComponent from "../base/base.component.js";

export default class ProfileComponent extends BaseComponent {
  selector = "profile";
  pageTitle = "Profile";
  pageIcon = "fa-user";
  access = ["user", "appraiser", "admin"];

  onInit() {
    super.onInit();
  }
}
