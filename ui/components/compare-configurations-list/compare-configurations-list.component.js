"use strict";

import { RequestManager } from "../../modules/requests/requests.js";
import BaseComponent from "../base/base.component.js";
import DataGrid from "../../utilities/data-grid.js";
import Icons from "../../utilities/icons.js";
import { buildURL } from "../../routes/routes.js";
import { SelectEnvironments } from "../select-environments/select-environments.component.js";

export default class CompareConfigurationsListComponent extends BaseComponent {
  selector = "compare-configurations-list";
  pageTitle = "Compare Configurations List";
  pageIcon = "fa-th";
  access = ["admin"];

  onInit() {
    super.onInit();
  }
}
