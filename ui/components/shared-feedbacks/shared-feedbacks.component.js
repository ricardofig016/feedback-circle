import BaseComponent from "../base/base.component.js";
import { RequestManager } from "../../modules/requests/requests.js";
import DataGrid from "../../utilities/data-grid.js";
import formatDate from "../../utilities/format-date.js";
import formatText from "../../utilities/format-text.js";
import { buildURL } from "../../routes/routes.js";

export default class SharedFeedbacksComponent extends BaseComponent {
  selector = "shared-feedbacks";
  pageTitle = "Shared Feedbacks";
  pageIcon = "fa-share";
  access = ["user", "appraiser", "admin"];
  feedbacks;

  async onInit() {
    super.onInit();

    // Feedbacks request
    const url = "/feedbacks/senderid/" + this.session.user.user_id + "/scope/shared";
    this.feedbacks = await RequestManager.request("GET", url);

    const noFeedbacksSection = this.getElementById("no-feedbacks-section");
    noFeedbacksSection.hidden = true;
    if (!this.feedbacks || this.feedbacks.length === 0) {
      noFeedbacksSection.hidden = false;
      return;
    }

    const feedbacksGrid = new DataGrid(this.getElementById("feedbacks-data-grid"));

    this.feedbacks.forEach((feedback) => {
      console.table(feedback);

      // Create Row
      const row = new Map();

      // Title Column
      const feedbackUrl = buildURL("Feedback", { id: feedback.feedback_id });
      const titleLink = "<a href=" + feedbackUrl + ">" + formatText(feedback.title) + "</a>";
      row.set("title", titleLink);
      // To Column
      const to = formatText(feedback.receiver_name);
      row.set("to", to);
      // Submitted On Column
      const submssionDate = formatDate(new Date(feedback.submission_date));
      row.set("submitted on", submssionDate);
      // Competency Column
      row.set("competency", formatText(feedback.competency));

      // Add Row to Grid
      feedbacksGrid.addRow(row);
    });
    // Render grid
    feedbacksGrid.render();
  }
}
