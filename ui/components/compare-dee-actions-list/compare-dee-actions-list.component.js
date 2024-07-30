"use strict";

import { RequestManager } from "../../modules/requests/requests.js";
import BaseComponent from "../base/base.component.js";
import DataGrid from "../../utilities/data-grid.js";
import Icons from "../../utilities/icons.js";
import { buildURL } from "../../routes/routes.js";
import { SelectEnvironments } from "../select-environments/select-environments.component.js";

export default class CompareDEEActionsListComponent extends BaseComponent {
  selector = "compare-dee-actions-list";
  pageTitle = "Compare DEE Actions List";
  pageIcon = "fa-th";
  access = ["admin"];

  onInit() {
    super.onInit();

    const selectEnvironmentsBox = this.getElementById("compare-dee-actions-list-select-environments");
    const selectEnvironments = new SelectEnvironments();
    selectEnvironments.render(selectEnvironmentsBox, () => {
      const data = {
        LeftEnvironment: selectEnvironments.getSelectedEnvironment(0),
        RightEnvironment: selectEnvironments.getSelectedEnvironment(1),
      };

      RequestManager.request("GetActionsFromMultipleEnvironments", data, (responseData) => {
        const actionList = responseData.ActionNameList;
        const apiCompareDEEActionsCode = "CompareDEEActionsCode";

        const dataGridDEEActionsTable = this.getElementById("compare-dee-actions-list-data-grid-dee-actions");
        if (dataGridDEEActionsTable) {
          const dataGridDEEActions = new DataGrid(dataGridDEEActionsTable);

          for (const actionRow of actionList) {
            let row = new Map();
            row.set("Result", actionRow.AreEqual ? Icons.green_checkmark_full : Icons.red_exclamation_mark);
            if (actionRow.IsInEnvironment1 && actionRow.IsInEnvironment2) {
              row.set("Name", `<a href='${buildURL(apiCompareDEEActionsCode, { name: actionRow.Name, env1: data.LeftEnvironment, env2: data.RightEnvironment })}'>${actionRow.Name}</a>`);
            } else {
              row.set("Name", actionRow.Name);
            }
            row.set("Exists in 1", actionRow.IsInEnvironment1 ? Icons.checkmark : "");
            row.set("Exists in 2", actionRow.IsInEnvironment2 ? Icons.checkmark : "");
            dataGridDEEActions.addRow(row);
          }
          dataGridDEEActions.render();
        }
      });
    });
  }
}
