"use strict";

import BaseComponent from "../base/base.component.js";
import { RequestManager } from "../../modules/requests/requests.js";
import formatText from "../../utilities/format-text.js";
import formatDate from "../../utilities/format-date.js";

export default class FeedbackComponent extends BaseComponent {
  selector = "feedback";
  pageTitle = "Feedback";
  pageIcon = "fa-tag";
  access = ["admin"];
  feedback;
  sender;
  receiver;
  role;

  async onInit(isRefresh = false) {
    super.onInit();

    if (!this.feedback) this.feedback = await RequestManager.request("GET", "feedbacks/" + this.queryParams.id);
    if (!this.sender) this.sender = await RequestManager.request("GET", "users/id/" + this.feedback.sender_id);
    if (!this.receiver) this.receiver = await RequestManager.request("GET", "users/id/" + this.feedback.receiver_id);
    console.table(this.feedback);

    // get role of the user related to this feedback
    this.role = this.session.user.user_id == this.receiver.user_id ? "receiver" : "appraiser";
    // show appraiser only container to the appraiser
    if (this.role === "appraiser") this.getElementById("appraiser-only-container").style.display = "block";

    // mark the feedback as read every time this tab is opened/refreshed
    await this.updateIsRead(true);

    // sender and receiver
    this.getElementById("sender").innerHTML = this.feedback.privacy === "anonymous" ? "<i>anonymous</i>" : formatText(this.sender.name, 1000);
    this.getElementById("receiver").innerText = this.receiver.name;
    // date and time
    const fullDate = formatDate(new Date(this.feedback.submission_date));
    this.getElementById("date").innerText = fullDate.substring(0, fullDate.indexOf(" "));
    this.getElementById("time").innerText = fullDate.substring(fullDate.indexOf(" "));
    // positive message
    this.getElementById("positive").innerText = this.feedback.positive_message;
    // negative message
    this.getElementById("negative").innerText = this.feedback.negative_message;
    // category
    const categories = {
      general: "General",
      "execution-and-delivery": "Execution and Delivery",
      innovation: "Innovation",
      agility: "Agility",
      commitment: "Commitment",
      communication: "Communication",
      "customer-orientation": "Customer Orientation",
    };
    this.getElementById("category").innerText = categories[this.feedback.category];
    // rating
    for (let i = 1; i <= this.feedback.rating; i++) this.getElementById("star" + i).classList.add("blue-star");
    // unread checkbox
    document.getElementById("unread-checkbox").checked = !Boolean(this.feedback["is_read_" + this.role]);
    // share checkbox
    this.getElementById("share-span").innerText = this.receiver.name.substring(0, this.receiver.name.indexOf(" "));
    document.getElementById("share-checkbox").checked = this.feedback.visibility === "both";
    // appraiser notes
    this.getElementById("appraiser-notes").innerText = this.feedback.appraiser_notes;
    this.getElementById("appraiser-notes-textarea").value = this.feedback.appraiser_notes;

    if (!isRefresh) this.addEventListeners();
  }

  addEventListeners() {
    // mark as read/unread
    const unreadCheckbox = this.getElementById("unread-checkbox");
    unreadCheckbox.addEventListener("change", async (e) => {
      this.updateIsRead(!e.target.checked);
    });
    // share/unshare with apraisee
    const shareCheckbox = this.getElementById("share-checkbox");
    shareCheckbox.addEventListener("change", async (e) => {
      this.feedback.visibility = e.target.checked ? "both" : "appraiser";
      await RequestManager.request("PUT", "feedbacks/" + this.queryParams.id + "/visibility", { visibility: this.feedback.visibility });
    });
    // edit appraiser notes
    const editButton = this.getElementById("edit-appraiser-notes-button");
    editButton.addEventListener("click", () => {
      this.goToEditNotes();
    });
    // submit change to appraiser notes
    const notesTextarea = this.getElementById("appraiser-notes-textarea");
    notesTextarea.addEventListener("keydown", async (e) => {
      if (e.key === "Enter") return await this.submitNotes();
      if (e.key === "Escape") return this.exitEditMode();
    });
  }

  goToEditNotes() {
    // go to edit mode
    this.getElementById("appraiser-notes-display-mode").hidden = true;
    this.getElementById("appraiser-notes-edit-mode").hidden = false;
    // make the textarea element active
    this.getElementById("appraiser-notes-textarea").focus();
  }

  async submitNotes() {
    // submit
    const newNotes = this.getElementById("appraiser-notes-textarea").value;
    if (newNotes != this.feedback.appraiser_notes) {
      // update database
      await RequestManager.request("PUT", "feedbacks/" + this.feedback.feedback_id + "/appraisernotes", { notes: newNotes });
      // update feedback oject
      this.feedback.appraiser_notes = newNotes;
      // update notes in display mode
      this.getElementById("appraiser-notes").innerText = newNotes;
    }
    // go to display mode
    this.getElementById("appraiser-notes-display-mode").hidden = false;
    this.getElementById("appraiser-notes-edit-mode").hidden = true;
  }

  exitEditMode() {
    // reset notes
    this.getElementById("appraiser-notes-textarea").value = this.feedback.appraiser_notes;
    // go to display mode
    this.getElementById("appraiser-notes-display-mode").hidden = false;
    this.getElementById("appraiser-notes-edit-mode").hidden = true;
  }

  async render() {
    if (!this.feedback) this.feedback = await RequestManager.request("GET", "feedbacks/" + this.queryParams.id);
    this.pageTitle = this.feedback.title;
    return super.render();
  }

  async hasAccess() {
    if (!this.feedback) this.feedback = await RequestManager.request("GET", "feedbacks/" + this.queryParams.id);
    const receiverId = this.feedback.receiver_id;
    if (!this.receiver) this.receiver = await RequestManager.request("GET", "users/id/" + receiverId);
    const access = super.hasAccess();
    if (access) return true; // user is admin
    if (this.receiver.appraiser_id === this.session.user.user_id) return true; // user is the appraiser
    if (this.receiver.user_id === this.session.user.user_id && this.feedback.visibility === "both") return true; // user is the receiver and has visibility
    return false;
  }

  async updateIsRead(isRead) {
    const url = "feedbacks/" + this.queryParams.id + "/isread/" + this.role;
    await RequestManager.request("PUT", url, { isRead: isRead });
    this.feedback["is_read_" + this.role] = isRead;
  }
}
