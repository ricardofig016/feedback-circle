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
    // hide all appraiser only elements if user is the receiver
    if (this.role === "receiver") {
      const appraiserOnlyElems = this.getElementsByClassName("appraiser-only");
      appraiserOnlyElems.forEach((element) => (element.classList = "do-not-display"));
    }

    // mark the feedback as read every time this tab is opened/refreshed
    await this.updateIsRead(true);

    // sender and receiver
    this.getElementById("sender").innerHTML = this.feedback.privacy === "anonymous" ? "<i>anonymous</i>" : formatText(this.sender.name, 1000);
    this.getElementById("receiver").innerText = this.receiver.name;
    // date and time
    const fullDate = formatDate(new Date(this.feedback.submission_date));
    this.getElementById("date").innerText = fullDate.substring(0, fullDate.indexOf(" "));
    this.getElementById("time").innerText = fullDate.substring(fullDate.indexOf(" "));
    // messages
    this.switchAppraiserMessage("positive", "original");
    this.switchAppraiserMessage("negative", "original");
    this.resetMessage("positive");
    this.resetMessage("negative");
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
    if (this.feedback.appraiser_notes) this.getElementById("appraiser-notes").innerText = this.feedback.appraiser_notes;
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

    const codes = ["negative-message", "positive-message", "appraiser-notes"];
    codes.forEach((code) => {
      // edit
      const editButton = this.getElementById("edit-" + code + "-button");
      editButton.addEventListener("click", () => {
        this.goToEditMode(code);
      });
      // exit
      const textarea = this.getElementById(code + "-textarea");
      textarea.addEventListener("keydown", async (e) => {
        if (e.key === "Escape") this.exitEditMode(code);
      });
    });
    // save buttons
    const positiveSaveButton = this.getElementById("positive-message-save-button");
    positiveSaveButton.addEventListener("click", async () => await this.submitAppraiserMessage("positive"));
    const negativeSaveButton = this.getElementById("negative-message-save-button");
    negativeSaveButton.addEventListener("click", async () => await this.submitAppraiserMessage("negative"));
    const appraiserNotesSaveButton = this.getElementById("appraiser-notes-save-button");
    appraiserNotesSaveButton.addEventListener("click", async () => await this.submitAppraiserNotes());
    // message anchors
    const positiveAnchor = this.getElementById("positive-anchor");
    positiveAnchor.addEventListener("click", () => {
      const message = positiveAnchor.innerText.includes("original") ? "original" : "appraiser";
      this.switchAppraiserMessage("positive", message);
    });
    const negativeAnchor = this.getElementById("negative-anchor");
    negativeAnchor.addEventListener("click", () => {
      const message = negativeAnchor.innerText.includes("original") ? "original" : "appraiser";
      this.switchAppraiserMessage("negative", message);
    });
  }

  goToEditMode(code) {
    // go to edit mode
    this.getElementById(code + "-display-mode").hidden = true;
    this.getElementById(code + "-edit-mode").hidden = false;
    // make the textarea element active
    this.getElementById(code + "-textarea").focus();
  }

  async submitAppraiserMessage(type) {
    const message = this.getElementById(type + "-message-textarea").value;
    if (message != this.feedback[type + "_message_appraiser_edit"]) {
      // update database
      const url = "feedbacks/" + this.feedback.feedback_id + "/appraisermessage/" + type;
      console.log(url);
      await RequestManager.request("PUT", url, { message: message });
      // update feedback oject
      this.feedback[type + "_message_appraiser_edit"] = message;
      // update message in display mode
      this.switchAppraiserMessage(type, "appraiser");
    }
    // go to display mode
    this.getElementById(type + "-message-display-mode").hidden = false;
    this.getElementById(type + "-message-edit-mode").hidden = true;
  }

  async submitAppraiserNotes() {
    // submit
    const newNotes = this.getElementById("appraiser-notes-textarea").value;
    if (newNotes != this.feedback.appraiser_notes) {
      // update database
      const url = "feedbacks/" + this.feedback.feedback_id + "/appraisernotes";
      await RequestManager.request("PUT", url, { notes: newNotes });
      // update feedback oject
      this.feedback.appraiser_notes = newNotes;
      // update notes in display mode
      const notesElem = this.getElementById("appraiser-notes");
      if (newNotes) notesElem.innerText = newNotes;
      else notesElem.innerHTML = "<i>your notes</i>";
    }
    // go to display mode
    this.getElementById("appraiser-notes-display-mode").hidden = false;
    this.getElementById("appraiser-notes-edit-mode").hidden = true;
  }

  exitEditMode(code) {
    ["negative-message", "positive-message", "appraiser-notes"];
    // reset notes
    if (code === "negative-message") this.resetMessage("negative");
    if (code === "positive-message") this.resetMessage("positive");
    if (code === "appraiser-notes") this.resetNotes();
    // go to display mode
    this.getElementById(code + "-display-mode").hidden = false;
    this.getElementById(code + "-edit-mode").hidden = true;
  }

  resetMessage(type) {
    this.getElementById(type + "-message-textarea").value = this.feedback[type + "_message_appraiser_edit"];
  }

  resetNotes() {
    this.getElementById("appraiser-notes-textarea").value = this.feedback.appraiser_notes;
  }

  /**
   *
   * @param {string} type positive or negative
   * @param {string} message original or appraiser (which one to switch to)
   */
  switchAppraiserMessage(type, message) {
    const column = message === "original" ? "" : "_appraiser_edit";
    const text = message === "original" ? "show appraiser edit" : "show original";
    this.getElementById(type).innerText = this.feedback[type + "_message" + column];
    this.getElementById(type + "-anchor").innerText = text;
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
