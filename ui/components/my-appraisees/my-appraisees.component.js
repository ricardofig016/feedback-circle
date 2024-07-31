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

        for (let i = 0; i < appraisees.length; i++) {
          const appraisee = appraisees[i];
          RequestManager.request("GET", "feedbacks/mostrecent/receiverid/" + appraisee.user_id, null, (feedbacks) => {
            // Create Row
            const row = new Map();
            // Name Column
            const appraiseeUrl = buildURL("Appraisee", { id: appraisee.user_id });
            const nameLink = "<a href=" + appraiseeUrl + ">" + appraisee.name + "</a>";
            row.set("name", nameLink);
            // Notes Column
            const note = appraisee.appraiser_notes;
            row.set("notes", note);
            // Most recent feedback Column
            const feedbackTitle = feedbacks[0] ? feedbacks[0].title : "---";
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
          });
        }
      },
      (error) => {
        throwError(error);
      }
    );
  }
}
