"use strict";

import BaseComponent from "../base/base.component.js";

export default class TestComponentComponent extends BaseComponent {
  selector = "test-component";
  pageTitle = "Test Component";
  pageIcon = "fa-th";
  access = ["admin"];

  onInit() {
    super.onInit();
  }
}
