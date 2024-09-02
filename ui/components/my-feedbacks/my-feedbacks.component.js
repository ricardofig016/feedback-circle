import BaseComponent from "../base/base.component.js";
import { RequestManager } from "../../modules/requests/requests.js";
import DataGrid from "../../utilities/data-grid.js";
import formatDate from "../../utilities/format-date.js";
import { buildURL } from "../../routes/routes.js";

export default class MyFeedbacksComponent extends BaseComponent {
  selector = "my-feedbacks";
  pageTitle = "My Feedbacks";
  pageIcon = "fa-list-ul";
  access = ["user", "appraiser", "manager", "admin"];
  feedbacks;

  async onInit() {
    super.onInit();

    // Feedbacks request
    const url = "feedbacks/targetid/" + this.session.user.user_id + "/role/target";
    this.feedbacks = await RequestManager.request("GET", url);

    const noFeedbacksContainer = this.getElementById("no-feedbacks");
    noFeedbacksContainer.hidden = true;
    if (!this.feedbacks || this.feedbacks.length === 0) {
      noFeedbacksContainer.hidden = false;
      return;
    }

    const feedbacksGrid = new DataGrid(this.getElementById("feedbacks-data-grid"));

    this.feedbacks.forEach((feedback) => {
      console.table(feedback);

      // Create Row
      const row = new Map();

      // Title Column
      const newFeedbackIcon = feedback.is_read_target ? "" : "<i class='new-feedback-icon fa fa-circle'></i>";
      const feedbackUrl = buildURL("Feedback", { id: feedback.feedback_id });
      const titleLink = "<a href=" + feedbackUrl + ">" + feedback.title + "</a>";
      row.set("title", newFeedbackIcon + titleLink);
      // From Column
      const from = feedback.sender_name === "anonymous" ? "<i>" + feedback.sender_name + "</i>" : feedback.sender_name;
      row.set("from", from);
      // Submitted On Column
      const submssionDate = formatDate(new Date(feedback.submission_date));
      row.set("submitted on", submssionDate);
      // Competency Column
      row.set("competency / company value", feedback.competency);

      // Add Row to Grid
      feedbacksGrid.addRow(row);
    });
    // Render grid
    feedbacksGrid.render();
  }
}
