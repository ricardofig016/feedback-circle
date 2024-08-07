import BaseComponent from "../base/base.component.js";
import { RequestManager } from "../../modules/requests/requests.js";
import DataGrid from "../../utilities/data-grid.js";
import formatDate from "../../utilities/format-date.js";
import formatText from "../../utilities/format-text.js";
import { buildURL } from "../../routes/routes.js";

export default class MyFeedbacksComponent extends BaseComponent {
  selector = "my-feedbacks";
  pageTitle = "My Feedbacks";
  pageIcon = "fa-list-ul";
  access = ["user", "appraiser", "admin"];
  appraisee;

  async onInit() {
    super.onInit();

    // Feedbacks request
    const feedbacks = await RequestManager.request("GET", "feedbacks/mostrecent/receiverid/" + this.session.user.user_id);
    const noFeedbacksSection = this.getElementById("no-feedbacks-section");
    noFeedbacksSection.hidden = true;
    if (!feedbacks || feedbacks.length === 0) {
      noFeedbacksSection.hidden = false;
      return;
    }

    const feedbacksGrid = new DataGrid(this.getElementById("feedbacks-data-grid"));

    for (let i = 0; i < feedbacks.length; i++) {
      const feedback = feedbacks[i];

      if (feedback.visibility != "both") continue; // The user does not have access to this feedback

      // Create Row
      const row = new Map();

      // Title Column
      const feedbackUrl = buildURL("Feedback", { id: feedback.feedback_id });
      const titleLink = "<a href=" + feedbackUrl + ">" + formatText(feedback.title) + "</a>";
      row.set("title", titleLink);
      // From Column
      const from = feedback.privacy === "anonymous" ? "<i>anonymous</i>" : formatText(feedback.sender_name);
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

      // Add Row to Grid
      feedbacksGrid.addRow(row);
      // Render grid if all rows have been added
    }
    feedbacksGrid.render();
  }
}
