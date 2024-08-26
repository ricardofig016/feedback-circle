"use strict";

import BaseComponent from "../base/base.component.js";
import DataGrid from "../../utilities/data-grid.js";
import { RequestManager } from "../../modules/requests/requests.js";
import { buildURL } from "../../routes/routes.js";
import Session from "../../modules/session/session.js";
import { throwError } from "../../modules/errors/errors.js";
import formatText from "../../utilities/format-text.js";

export default class MyAppraiseesComponent extends BaseComponent {
  selector = "my-appraisees";
  pageTitle = "My Appraisees";
  pageIcon = "fa-users";
  access = ["appraiser", "admin"];
  appraisees;

  async onInit() {
    super.onInit();

    // Appraisees request
    const url = "users/appraiserid/" + this.session.user.user_id;
    this.appraisees = await RequestManager.request("GET", url);

    const noAppraiseesContainer = this.getElementById("no-appraisees");
    noAppraiseesContainer.hidden = true;
    if (!this.appraisees || this.appraisees.length === 0) {
      noAppraiseesContainer.hidden = false;
      return;
    }

    const appraiseesGrid = new DataGrid(this.getElementById("appraisees-data-grid"));

    this.appraisees.forEach((appraisee) => {
      console.table(appraisee);

      // Create Row
      const row = new Map();
      // Name Column
      const appraiseeUrl = buildURL("Appraisee", { id: appraisee.user_id });
      const nameLink = "<a href=" + appraiseeUrl + ">" + formatText(appraisee.name) + "</a>";
      row.set("name", nameLink);
      // Notes Column
      const note = appraisee.appraiser_notes ? formatText(appraisee.appraiser_notes) : "---";
      row.set("notes", note);
      // Most recent feedback Column
      const feedbackTitle = appraisee.feedback_title ? formatText(appraisee.feedback_title) : "---";
      row.set("most recent feedback", feedbackTitle);
      // Notification Column
      const unreadFeedbacks = appraisee.unread_count ? appraisee.unread_count : 0;
      const notification = unreadFeedbacks ? "You have <span style='color:#f69414;font-weight:bold'>" + unreadFeedbacks + "</span> unread feedbacks" : "You're all caught up!";
      row.set("notifications", notification);

      // Add Row to Grid
      appraiseesGrid.addRow(row);
    });
    // Render grid
    appraiseesGrid.render();
  }
}
