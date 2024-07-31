"use strict";

import BaseComponent from "../base/base.component.js";
import DataGrid from "../../utilities/data-grid.js";
import Icons from "../../utilities/icons.js";
import { RequestManager } from "../../modules/requests/requests.js";
import { buildURL } from "../../routes/routes.js";
import Session from "../../modules/session/session.js";
import { throwError } from "../../modules/errors/errors.js";

export default class MyAppraiseesComponent extends BaseComponent {
  selector = "my-appraisees";
  pageTitle = "My Appraisees";
  pageIcon = "fa-th";
  access = ["appraiser", "admin"];

  onInit() {
    super.onInit();

    const session = new Session();
    RequestManager.request(
      "GET",
      "users/appraiserid/" + session.user.user_id,
      null,
      (appraisees) => {
        if (!appraisees || appraisees.length === 0) throw new Error("No users found with appraiser_id " + session.user.user_id);
        const appraiseesGrid = new DataGrid(this.getElementById("appraisees-data-grid"));

        appraisees.forEach((appraisee) => {
          console.table(appraisee);
          // Create Row
          const row = new Map();
          // Name Column
          const appraiseeUrl = buildURL("Apraisee", { id: appraisee.user_id });
          row.set("name", "<a href=" + appraiseeUrl + ">" + appraisee.name + "</a>");
          // Notes Column
          const notes = appraisee.appraiser_notes;
          row.set("notes", notes);
          // Notification Column
          const tooltipElem = "<div class='tooltip tooltip-small'><p>" + "you have 3 new feedbacks / you're all caught up" + "</p></div>"; // TODO: determine tooltip text and icon
          const tooltipIcon = Icons.blue_exclamation_mark;
          const notifications = "<div style='text-align:center'>" + tooltipIcon + tooltipElem + "</div>";
          row.set("notifications", notifications);
          // Add Row to Grid
          appraiseesGrid.addRow(row);
        });

        appraiseesGrid.render();
      },
      (error) => {
        throwError(error);
      }
    );
  }
}
