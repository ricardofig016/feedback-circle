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
    const url = "feedbacks/mostrecent/receiverid/" + this.queryParams.id + "/role/appraiser";
    this.feedbacks = await RequestManager.request("GET", url);

    const noFeedbacksSection = this.getElementById("no-feedbacks-section");
    noFeedbacksSection.hidden = true;
    if (!this.feedbacks || this.feedbacks.length === 0) {
      noFeedbacksSection.hidden = false;
      return;
    }

    const feedbacksGrid = new DataGrid(this.getElementById("feedbacks-data-grid"));

    for (let i = 0; i < this.feedbacks.length; i++) {
      const feedback = this.feedbacks[i];
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
      // My Notes Column
      row.set("my notes", formatText(feedback.appraiser_notes));

      // Add Row to Grid
      feedbacksGrid.addRow(row);
      // Render grid if all rows have been added
      if (i === this.feedbacks.length - 1) feedbacksGrid.render();
    }
  }

  async render() {
    if (!this.appraisee) this.appraisee = await RequestManager.request("GET", "users/id/" + this.queryParams.id);
    this.pageTitle = this.appraisee.name;
    return super.render();
  }

  async hasAccess() {
    if (!this.appraisee) this.appraisee = await RequestManager.request("GET", "users/id/" + this.queryParams.id);
    const access = super.hasAccess();
    if (access) return true; // user is admin
    if (this.appraisee.appraiser_id === this.session.user.user_id) return true; // user is the apraiser
    return false;
  }
}
