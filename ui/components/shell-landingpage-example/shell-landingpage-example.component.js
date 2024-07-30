"use strict";

import { RequestManager } from "../../modules/requests/requests.js";
import BaseComponent from "../base/base.component.js";
import DataGrid from "../../utilities/data-grid.js";
import String from "../../utilities/string.js";
import Icons from "../../utilities/icons.js";
import { buildURL } from "../../routes/routes.js";
import { ToastManager } from "../../modules/toasts/toasts.js";

export default class PageExampleComponent extends BaseComponent {
  selector = "shell-landingpage-example"; // HTML selector
  pageTitle = "Page Example";
  pageIcon = "fa-building";
  access = ["admin"];

  onInit() {
    super.onInit();

    // Access DOM elements, buttons and event handlers
    const buttonA = this.getElementById("button-A");
    const buttonC = this.getElementById("button-C");
    buttonA.onclick = (e) => {
      new ToastManager().showToast("Success", "Success message", "success");
      new ToastManager().showToast("Error", "Error message", "error");
    };
    buttonC.onclick = (e) => {
      new ToastManager().showToast("Info", "Info message", "info");
      new ToastManager().showToast("Warning", "Warning message", "warning");
    };

    // Links
    const linkA = this.getElementById("link-A");
    linkA.setAttribute("href", `${buildURL("CompareInstallationsScaffolding", { x: "y" })}`);

    // Data Grid
    const dataGridExampleTable = this.getElementById("example-data-grid");
    if (dataGridExampleTable) {
      const dataGridExample = new DataGrid(dataGridExampleTable);

      const row = new Map();
      row.set("Column 1", Icons.green_checkmark_full);
      row.set("Column 2", Icons.red_exclamation_mark);
      row.set("Column 3", Icons.checkmark);
      row.set("Column 4", Icons.green_plug);
      row.set("Column 5", Icons.toast_error);
      row.set("Column 6", Icons.toast_info);
      row.set("Column 7", Icons.toast_success);
      row.set("Column 8", Icons.toast_warning);
      row.set("Column 9", "Text");
      const queryParamsMap = {
        installationPath1: "123",
        installationPath2: "456",
      };
      row.set("Column 10", `<a href=${buildURL("CompareInstallationsScaffolding", queryParamsMap)}>Link example</a>`);

      dataGridExample.addRow(row);

      dataGridExample.render();
    }

    // Server requests
    const buttonE = this.getElementById("button-E");
    buttonE.onclick = (e) => {
      // Data to send to the server
      const data = {
        exampleDataKey1: "exampleDataValue1",
        exampleDataKey2: "exampleDataValue2",
      };
      RequestManager.request("GetActionsFromMultipleEnvironments", data, (responseData) => {
        const actionList = responseData.ActionNameList;
        const apiCompareDEEActionsCode = "CompareDEEActionsCode";

        if (dataGridDEEActionsTable) {
          const dataGridExample = new DataGrid(dataGridExampleTable);

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
            dataGridExample.addRow(row);
          }
          dataGridExample.render();
        }
      });
    };
  }
}
