import BaseComponent from "../base/base.component.js";
import { RequestManager } from "../../modules/requests/requests.js";
import DataGrid from "../../utilities/data-grid.js";
import formatDate from "../../utilities/format-date.js";
import formatText from "../../utilities/format-text.js";
import { buildURL } from "../../routes/routes.js";

export default class AppraiseeComponent extends BaseComponent {
  selector = "appraisee";
  pageTitle = "Appraisee";
  pageIcon = "fa-user";
  access = ["admin"];

  onInit() {
    super.onInit();

    // Appraisee request
    RequestManager.request("GET", "users/id/" + this.queryParams.id, null, (appraisee) => {
      if (!appraisee) throw new Error("No user found with user_id " + this.queryParams.id);

      // Feedbacks request
      RequestManager.request("GET", "feedbacks/mostrecent/receiverid/" + appraisee.user_id, null, (feedbacks) => {
        if (!feedbacks || feedbacks.length === 0) throw new Error("No feedbacks found for user with user_id " + appraisee.user_id);

        const feedbacksGrid = new DataGrid(this.getElementById("feedbacks-data-grid"));

        for (let i = 0; i < feedbacks.length; i++) {
          const feedback = feedbacks[i];
          console.table(feedback);

          // Sender request
          RequestManager.request("GET", "users/id/" + feedback.sender_id, null, (sender) => {
            // Create Row
            const row = new Map();

            // Title Column
            const feedbackUrl = buildURL("Feedback", { id: feedback.feedback_id });
            const titleLink = "<a href=" + feedbackUrl + ">" + formatText(feedback.title) + "</a>";
            row.set("title", titleLink);
            // From Column
            const from = feedback.privacy === "anonymous" ? "<i>anonymous</i>" : formatText(sender.name);
            row.set("from", from);
            // Body Column
            row.set("body", formatText(feedback.body));
            // Submitted On Column
            const submssionDate = formatDate(new Date(feedback.submission_date));
            row.set("submitted on", submssionDate);
            // Category Column
            row.set("category", formatText(feedback.category));
            // Type Column
            const typeSymbol = feedback.type === "positive" ? "+" : "-";
            const typeElem = '<div style="text-align:center">' + typeSymbol + "</div>";
            row.set("type", typeElem);
            // My Notes Column
            row.set("my notes", formatText(feedback.appraiser_notes));

            // Add Row to Grid
            feedbacksGrid.addRow(row);
            // Render grid if all rows have been added
            if (i === feedbacks.length - 1) feedbacksGrid.render();
          });
        }
      });
    });
    (error) => {
      throwError(error);
    };
  }

  render() {
    return new Promise((resolve, reject) => {
      RequestManager.request("GET", "users/id/" + this.queryParams["id"], null, (response) => {
        this.pageTitle = response.name;
        const htmlPath = `components/${this.selector}/${this.selector}.component.html`;
        fetch(htmlPath)
          .then((html) => html.text())
          .then((html) => resolve(html))
          .catch((error) => reject(error));
      });
    });
  }

  hasAccess(user) {
    return new Promise((resolve, reject) => {
      RequestManager.request("GET", "users/id/" + this.queryParams["id"], null, (appraisee) => {
        super.hasAccess(user).then((access) => {
          if (access || appraisee.appraiser_id === user.user_id) resolve(true);
          else resolve(false);
        });
      });
    });
  }
}
