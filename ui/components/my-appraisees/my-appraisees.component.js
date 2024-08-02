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
  pageIcon = "fa-th";
  access = ["appraiser", "admin"];

  async onInit() {
    super.onInit();

    const session = new Session();

    // Appraisees request
    const appraisees = await RequestManager.request("GET", "users/appraiserid/" + session.user.user_id);
    if (!appraisees || appraisees.length === 0) {
      throwError("No users found with appraiser_id " + session.user.user_id);
      return;
    }
    const appraiseesGrid = new DataGrid(this.getElementById("appraisees-data-grid"));

    for (let i = 0; i < appraisees.length; i++) {
      const appraisee = appraisees[i];
      // Feedbacks request
      const feedbacks = await RequestManager.request("GET", "feedbacks/mostrecent/receiverid/" + appraisee.user_id);

      // Create Row
      const row = new Map();
      // Name Column
      const appraiseeUrl = buildURL("Appraisee", { id: appraisee.user_id });
      const nameLink = "<a href=" + appraiseeUrl + ">" + formatText(appraisee.name) + "</a>";
      row.set("name", nameLink);
      // Notes Column
      const note = formatText(appraisee.appraiser_notes);
      row.set("notes", note);
      // Most recent feedback Column
      const feedbackTitle = feedbacks[0] ? formatText(feedbacks[0].title) : "---";
      row.set("most recent feedback", feedbackTitle);
      // Notification Column
      let unreadFeedbacks = 0;
      feedbacks.forEach((feedback) => {
        if (!feedback.is_read) unreadFeedbacks++;
      });
      const notification = unreadFeedbacks ? "You have <span style='color:#f69414;font-weight:bold'>" + unreadFeedbacks + "</span> unread feedbacks" : "You're all caught up!";
      row.set("notifications", notification);

      // Add Row to Grid
      appraiseesGrid.addRow(row);

      // Render grid if all rows have been added
      if (i === appraisees.length - 1) appraiseesGrid.render();
    }
  }
}
