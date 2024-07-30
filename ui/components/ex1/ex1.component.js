"use strict";

import BaseComponent from "../base/base.component.js";

export default class Ex1 extends BaseComponent {
  selector = "ex1";
  pageTitle = "1";
  pageIcon = "fa-home";
  access = ["admin"];

  onInit() {
    super.onInit();
  }
}
