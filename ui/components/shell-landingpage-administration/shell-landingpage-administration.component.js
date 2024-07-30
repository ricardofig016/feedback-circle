"use strict";

import BaseComponent from "../base/base.component.js";

export default class ShellLandingPageAdministrationComponent extends BaseComponent {
  selector = "shell-landingpage-administration";
  pageTitle = "Administration";
  pageIcon = "fa-th";
  access = ["admin"];

  onInit() {
    super.onInit();
  }
}
