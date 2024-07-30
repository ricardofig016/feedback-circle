"use strict";

import BaseComponent from "../base/base.component.js";

export default class MyAppraiseesComponent extends BaseComponent {
  selector = "my-appraisees";
  pageTitle = "My Appraisees";
  pageIcon = "fa-th";
  access = ["appraiser", "admin"];

  onInit() {
    super.onInit();
  }
}
