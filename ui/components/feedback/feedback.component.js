"use strict";

import BaseComponent from "../base/base.component.js";
import { RequestManager } from "../../modules/requests/requests.js";
import formatDate from "../../utilities/format-date.js";
import Tabs from "../../modules/tabs/tabs.js";

export default class FeedbackComponent extends BaseComponent {
  selector = "feedback";
  pageTitle = "Feedback";
  pageIcon = "fa-tag";
  access = ["admin"];
  feedback;

  async onInit(isRefresh = false) {
    super.onInit();

    // request feedback
    await this.getFeedback();
    console.table(this.feedback);

    // hide all appraiser only elements if user is not the appraiser
    if (!this.feedback.user_roles.includes("appraiser")) {
      const appraiserOnlyElems = this.getElementsByClassName("appraiser-only");
      appraiserOnlyElems.forEach((element) => (element.classList = "do-not-display"));
    }

    // mark the feedback as read every time this tab is opened/refreshed, if user is not sender
    if (this.feedback.user_roles.includes("target")) await this.updateIsRead("target", true);
    if (this.feedback.user_roles.includes("appraiser")) await this.updateIsRead("appraiser", true);
    if (this.feedback.user_roles.includes("team_manager")) await this.updateIsRead("team_manager", true);

    // sender and target
    this.getElementById("sender").innerHTML = this.feedback.sender_name === "anonymous" ? "<i>" + this.feedback.sender_name + "</i>" : this.feedback.sender_name;
    this.getElementById("target").innerText = this.feedback.target_name;

    // date and time
    const fullDate = formatDate(new Date(this.feedback.submission_date));
    this.getElementById("date").innerText = fullDate.substring(0, fullDate.indexOf(" "));
    this.getElementById("time").innerText = fullDate.substring(fullDate.indexOf(" "));

    // messages
    if (!this.feedback.user_roles.includes("appraiser")) {
      if (!this.feedback.positive_message_appraiser_edit || this.feedback.positive_message === this.feedback.positive_message_appraiser_edit) {
        this.switchAppraiserMessage("positive", "original");
        // hide anchor
        this.getElementById("positive-anchor").hidden = true;
      } else this.switchAppraiserMessage("positive", "appraiser");
      if (!this.feedback.negative_message_appraiser_edit || this.feedback.negative_message === this.feedback.negative_message_appraiser_edit) {
        this.switchAppraiserMessage("negative", "original");
        // hide anchor
        this.getElementById("negative-anchor").hidden = true;
      } else this.switchAppraiserMessage("negative", "appraiser");
    } else {
      let message;
      if (this.feedback.user_roles.includes("sender")) message = "original";
      if (this.feedback.user_roles.includes("target")) message = "appraiser";
      this.switchAppraiserMessage("positive", message);
      this.switchAppraiserMessage("negative", message);
    }
    this.resetMessage("positive");
    this.resetMessage("negative");

    // competency
    const categories = {
      general: "General",
      "execution-and-delivery": "Execution and Delivery",
      innovation: "Innovation",
      agility: "Agility",
      commitment: "Commitment",
      communication: "Communication",
      "customer-orientation": "Customer Orientation",
    };
    this.getElementById("competency").innerText = categories[this.feedback.competency];

    // rating
    for (let i = 1; i <= this.feedback.rating; i++) this.getElementById("star" + i).classList.add("blue-star");

    // unread checkbox
    const unreadCheckbox = this.getElementById("unread-checkbox");
    if (this.feedback.user_roles.includes("target")) unreadCheckbox.checked = !Boolean(this.feedback.is_read_target);
    else if (this.feedback.user_roles.includes("appraiser")) unreadCheckbox.checked = !Boolean(this.feedback.is_read_appraiser);
    else if (this.feedback.user_roles.includes("team_manager")) unreadCheckbox.checked = !Boolean(this.feedback.is_read_team_manager);
    else unreadCheckbox.parentElement.hidden = true; // sender has no option read/unread

    // if the user is not the appraiser, they dont have the option to switch between original message and appraiser edit
    if (!this.feedback.user_roles.includes("appraiser")) {
      this.getElementById("positive-anchor").hidden = true;
      this.getElementById("negative-anchor").hidden = true;
    }

    // appraiser only
    if (this.feedback.user_roles.includes("appraiser")) {
      // share checkbox
      this.getElementById("share-span").innerText = this.feedback.target_name.substring(0, this.feedback.target_name.indexOf(" "));
      this.getElementById("share-checkbox").checked = this.feedback.target_visibility;
      // appraiser notes
      if (this.feedback.appraiser_notes) this.getElementById("appraiser-notes").innerText = this.feedback.appraiser_notes;
      this.getElementById("appraiser-notes-textarea").value = this.feedback.appraiser_notes;
    }

    // delete button
    if (this.feedback.can_delete) {
      this.getElementById("delete-button").hidden = false;
    }

    if (!isRefresh) this.addEventListeners();
  }

  addEventListeners() {
    // unread checkbox
    const unreadCheckbox = this.getElementById("unread-checkbox");
    unreadCheckbox.addEventListener("change", async (e) => {
      if (this.feedback.user_roles.includes("target")) this.updateIsRead("target", !e.target.checked);
      if (this.feedback.user_roles.includes("appraiser")) this.updateIsRead("appraiser", !e.target.checked);
      if (this.feedback.user_roles.includes("team_manager")) this.updateIsRead("team_manager", !e.target.checked);
    });

    // appraiser only
    if (this.feedback.user_roles.includes("appraiser")) {
      // share with apraisee
      const shareCheckbox = this.getElementById("share-checkbox");
      shareCheckbox.addEventListener("change", async (e) => {
        this.feedback.target_visibility = e.target.checked;
        const url = "feedbacks/" + this.queryParams.id + "/visibility/target";
        await RequestManager.request("PUT", url, { value: this.feedback.target_visibility });
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

    // delete button
    const deleteButton = this.getElementById("delete-button");
    deleteButton.addEventListener("click", async () => {
      if (this.feedback.can_delete) {
        await RequestManager.request("DELETE", "feedbacks/" + this.queryParams.id);
        // close tab
        const routePath = window.location.hash.substring(2);
        const tab = new Tabs().getTab(routePath);
        tab.close();
      }
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
      const url = "feedbacks/" + this.queryParams.id + "/appraisermessage/" + type;
      await RequestManager.request("PUT", url, { message: message });
      // update feedback oject
      this.feedback[type + "_message_appraiser_edit"] = message;
      // update message in display mode
      this.switchAppraiserMessage(type, "appraiser");
      //
      if (this.feedback[type + "_message"] === this.feedback[type + "_message_appraiser_edit"]) {
        this.getElementById(type + "-anchor").hidden = true;
      } else this.getElementById(type + "-anchor").hidden = false;
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
      const url = "feedbacks/" + this.queryParams.id + "/appraisernotes";
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

  async updateIsRead(role, isRead) {
    const url = "feedbacks/" + this.queryParams.id + "/isread/" + role;
    await RequestManager.request("PUT", url, { isRead: isRead });
    this.feedback["is_read_" + role] = isRead;
  }

  async getFeedback() {
    this.feedback = await RequestManager.request("GET", "feedbacks/" + this.queryParams.id + "/user/" + this.session.user.user_id);
  }

  async render() {
    await this.getFeedback();
    this.pageTitle = this.feedback.title;
    return super.render();
  }

  async hasAccess() {
    await this.getFeedback();
    console.table(this.feedback);
    const access = super.hasAccess();
    if (access) return true; // user is admin
    if (this.feedback.user_roles.includes("sender")) return true; // user is the sender
    if (this.feedback.user_roles.includes("target") && this.feedback.target_visibility) return true; // user is the target and has visibility
    if (this.feedback.user_roles.includes("appraiser") && this.feedback.appraiser_visibility) return true; // user is the appraiser and has visibility
    if (this.feedback.user_roles.includes("team_manager") && this.feedback.team_manager_visibility) return true; // user is the team manager and has visibility
    return false;
  }
}
