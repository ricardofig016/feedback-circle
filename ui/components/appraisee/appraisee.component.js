import BaseComponent from "../base/base.component.js";
import { RequestManager } from "../../modules/requests/requests.js";
import DataGrid from "../../utilities/data-grid.js";
import formatDate from "../../utilities/format-date.js";
import { buildURL } from "../../routes/routes.js";

export default class AppraiseeComponent extends BaseComponent {
  selector = "appraisee";
  pageTitle = "Appraisee";
  pageIcon = "fa-user";
  access = ["admin"];
  appraisee;
  feedbacks;

  async onInit(isRefresh) {
    super.onInit();

    // Feedbacks request
    const url = "feedbacks/targetid/" + this.queryParams.id + "/role/appraiser";
    this.feedbacks = await RequestManager.request("GET", url);

    // appraiser notes
    this.getAppraisee();
    console.table(this.appraisee);
    this.renderAppraiserNotes();

    // no feedbacks
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
      const newFeedbackIcon = feedback.is_read_appraiser ? "" : "<i class='new-feedback-icon fa fa-circle'></i>";
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
      // My Notes Column
      row.set("my notes", feedback.appraiser_notes);

      // Add Row to Grid
      feedbacksGrid.addRow(row);
    });

    feedbacksGrid.render();

    if (!isRefresh) this.addEventListeners();
  }

  addEventListeners() {
    const textarea = this.getElementById("appraiser-notes-textarea");
    // appraiser notes edit mode
    this.getElementById("appraiser-notes").addEventListener("click", (e) => {
      textarea.parentElement.hidden = false;
      textarea.value = e.target.innerText;
      e.target.hidden = true;
    });

    // edit mode save button
    this.getElementById("appraiser-notes-save-button").addEventListener("click", async () => {
      if (textarea.value !== this.appraisee.appraiser_notes) {
        this.appraisee.appraiser_notes = textarea.value;
        await this.updateAppraiserNotes(textarea.value);
      }
      textarea.parentElement.hidden = true;
      this.getElementById("appraiser-notes").hidden = false;
    });
  }

  async updateAppraiserNotes(notes) {
    const url = "users/" + this.appraisee.user_id + "/appraisernotes";
    await RequestManager.request("PUT", url, { notes });
    this.renderAppraiserNotes();
  }

  renderAppraiserNotes() {
    const appraiseeFirstName = this.appraisee.name.substring(0, this.appraisee.name.indexOf(" "));
    this.getElementById("appraiser-notes").innerText = this.appraisee.appraiser_notes ? this.appraisee.appraiser_notes : "use this section to take your notes about " + appraiseeFirstName;
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
