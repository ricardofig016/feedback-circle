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
  feedbacks;

  async onInit() {
    super.onInit();

    // Feedbacks request
    const url = "feedbacks/mostrecent/receiverid/" + this.session.user.user_id + "/role/receiver";
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
      // From Column
      const from = feedback.sender_name === "anonymous" ? "<i>" + feedback.sender_name + "</i>" : formatText(feedback.sender_name);
      row.set("from", from);
      // Submitted On Column
      const submssionDate = formatDate(new Date(feedback.submission_date));
      row.set("submitted on", submssionDate);
      // Category Column
      row.set("category", formatText(feedback.category));

      // Add Row to Grid
      feedbacksGrid.addRow(row);
    });
    // Render grid
    feedbacksGrid.render();
  }
}
