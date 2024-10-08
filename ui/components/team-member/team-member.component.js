import BaseComponent from "../base/base.component.js";
import { RequestManager } from "../../modules/requests/requests.js";
import DataGrid from "../../utilities/data-grid.js";
import formatDate from "../../utilities/format-date.js";
import { buildURL } from "../../routes/routes.js";

export default class TeamMemberComponent extends BaseComponent {
  selector = "team-member";
  pageTitle = "Team Member";
  pageIcon = "fa-user";
  access = ["admin"];
  teamMember;
  feedbacks;

  async onInit(isRefresh) {
    super.onInit();

    // Feedbacks request
    const url = "feedbacks/targetid/" + this.queryParams.id + "/role/manager";
    this.feedbacks = await RequestManager.request("GET", url);

    const noFeedbacksContainer = this.getElementById("no-feedbacks");
    noFeedbacksContainer.hidden = true;
    if (!this.feedbacks || this.feedbacks.length === 0) {
      noFeedbacksContainer.hidden = false;
      this.getElementById("type-filter-toggle-container").style.display = "none";
      return;
    }

    this.renderFeedbacksGrid("all");

    if (!isRefresh) this.addEventListeners();
  }

  addEventListeners() {
    const typeFilterToggleButton = this.getElementById("type-filter-toggle-button");
    typeFilterToggleButton.addEventListener("click", (e) => {
      // cycle through "all", "performance" and "continuous"
      if (e.target.innerText === "All") {
        e.target.innerText = "Performance";
        this.renderFeedbacksGrid("performance");
      } else if (e.target.innerText === "Performance") {
        e.target.innerText = "Continuous";
        this.renderFeedbacksGrid("continuous");
      } else if (e.target.innerText === "Continuous") {
        e.target.innerText = "All";
        this.renderFeedbacksGrid("all");
      }
    });
  }

  /**
   *
   * @param {string} typeFilter should be "all", "performance" or "continuous"
   */
  renderFeedbacksGrid(typeFilter) {
    const feedbacksGrid = new DataGrid(this.getElementById("feedbacks-data-grid"));

    let filteredFeedbacks = this.feedbacks;
    if (typeFilter !== "all") {
      filteredFeedbacks = this.feedbacks.filter((feedback) => feedback.type === typeFilter);
    }

    filteredFeedbacks.forEach((feedback) => {
      console.table(feedback);

      // Create Row
      const row = new Map();

      // Title Column
      const newFeedbackIcon = feedback.is_read_manager ? "" : "<i class='new-feedback-icon fa fa-circle'></i>";
      const feedbackUrl = buildURL("Feedback", { id: feedback.feedback_id });
      const titleLink = "<a href=" + feedbackUrl + ">" + feedback.title + "</a>";
      row.set("title", newFeedbackIcon + titleLink);
      // Type column
      row.set("type", feedback.type);
      // From Column
      const from = feedback.sender_name === "anonymous" ? "<i>" + feedback.sender_name + "</i>" : feedback.sender_name;
      row.set("from", from);
      // Submitted On Column
      const submssionDate = formatDate(new Date(feedback.submission_date));
      row.set("submitted on", submssionDate);
      // Competency Column
      row.set("competency / company value", feedback.competency);
      // Actions Column
      row.set("actions", feedback.actions);
      // My Notes Column
      row.set("my notes", feedback.manager_notes);

      // Add Row to Grid
      feedbacksGrid.addRow(row);
    });

    feedbacksGrid.render();
  }

  async getTeamMember() {
    this.teamMember = await RequestManager.request("GET", "users/id/" + this.queryParams.id);
  }

  async render() {
    await this.getTeamMember();
    this.pageTitle = this.teamMember.name;
    return super.render();
  }

  async hasAccess() {
    await this.getTeamMember();
    const access = super.hasAccess();
    if (access) return true; // user is admin
    if (this.teamMember.manager_id === this.session.user.user_id) return true; // user is the manager
    return false;
  }
}
