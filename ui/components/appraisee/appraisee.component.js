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
  appraisee;
  feedbacks;

  async onInit() {
    super.onInit();

    // Feedbacks request
    const url = "feedbacks/targetid/" + this.queryParams.id + "/role/appraiser";
    this.feedbacks = await RequestManager.request("GET", url);

    const noFeedbacksContainer = this.getElementById("no-feedbacks");
    noFeedbacksContainer.hidden = true;
    if (!this.feedbacks || this.feedbacks.length === 0) {
      noFeedbacksContainer.hidden = false;
      return;
    }

    const feedbacksGrid = new DataGrid(this.getElementById("feedbacks-data-grid"));

    for (let i = 0; i < this.feedbacks.length; i++) {
      const feedback = this.feedbacks[i];
      console.table(feedback);

      // Create Row
      const row = new Map();

      // Title Column
      const newFeedbackIcon = feedback.is_read_appraiser ? "" : "<i class='new-feedback-icon fa fa-circle'></i>";
      const feedbackUrl = buildURL("Feedback", { id: feedback.feedback_id });
      const titleLink = "<a href=" + feedbackUrl + ">" + formatText(feedback.title) + "</a>";
      row.set("title", newFeedbackIcon + titleLink);
      // From Column
      const from = feedback.sender_name === "anonymous" ? "<i>" + feedback.sender_name + "</i>" : formatText(feedback.sender_name);
      row.set("from", from);
      // Submitted On Column
      const submssionDate = formatDate(new Date(feedback.submission_date));
      row.set("submitted on", submssionDate);
      // Competency Column
      row.set("competency", formatText(feedback.competency));
      // My Notes Column
      row.set("my notes", formatText(feedback.appraiser_notes));

      // Add Row to Grid
      feedbacksGrid.addRow(row);
      // Render grid if all rows have been added
      if (i === this.feedbacks.length - 1) feedbacksGrid.render();
    }
  }

  async getAppraisee() {
    this.appraisee = await RequestManager.request("GET", "users/id/" + this.queryParams.id);
  }

  async render() {
    await this.getAppraisee();
    this.pageTitle = this.appraisee.name;
    return super.render();
  }

  async hasAccess() {
    await this.getAppraisee();
    const access = super.hasAccess();
    if (access) return true; // user is admin
    if (this.appraisee.appraiser_id === this.session.user.user_id) return true; // user is the apraiser
    return false;
  }
}
