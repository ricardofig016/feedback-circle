"use strict";

import BaseComponent from "../base/base.component.js";
import { RequestManager } from "../../modules/requests/requests.js";
import formatDate from "../../utilities/format-date.js";
import Tabs from "../../modules/tabs/tabs.js";
import DataGrid from "../../utilities/data-grid.js";
import ConfirmationWindow from "../../modules/confirmation-window/confirmation-window.js";

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

    // mark the feedback as read every time this tab is opened/refreshed, if user is not sender
    if (this.feedback.user_roles.includes("target")) await this.updateIsRead("target", true);
    if (this.feedback.user_roles.includes("appraiser")) await this.updateIsRead("appraiser", true);
    if (this.feedback.user_roles.includes("manager")) await this.updateIsRead("manager", true);

    this.hideNoAccessSections();

    this.fillValueFields();

    this.hideAndDisableOptionsButtons();

    if (!isRefresh) this.addEventListeners();
  }

  hideNoAccessSections() {
    // hide appraiser section if user is not the appraiser
    if (!this.feedback.user_roles.includes("appraiser")) {
      const appraiserSection = this.getElementById("appraiser-section");
      appraiserSection.style.display = "none";
    }

    // hide continuous section if feedback type is not continuous
    if (this.feedback.type !== "continuous") {
      const continuousSection = this.getElementById("continuous-section");
      continuousSection.style.display = "none";
    }

    // hide rating if feedback type is not performance
    if (this.feedback.type !== "performance") this.getElementById("rating-container").style.display = "none";
  }

  fillValueFields() {
    // sender and target
    this.getElementById("from-value").innerHTML = this.feedback.sender_name === "anonymous" ? "<i>" + this.feedback.sender_name + "</i>" : this.feedback.sender_name;
    this.getElementById("to-value").innerText = this.feedback.target_name;

    // date and time
    const fullDate = formatDate(new Date(this.feedback.submission_date));
    this.getElementById("date-value").innerText = fullDate.substring(0, fullDate.indexOf(" "));
    //this.getElementById("time-value").innerText = fullDate.substring(fullDate.indexOf(" "));

    // type
    const type = this.feedback.type === "performance" ? "Performance Appraisal" : "Continuous Feedback";
    this.getElementById("type-value").innerText = type;

    // context
    const contexts = {
      feedback: "Feedback",
      council: "Council",
      squad: "Squad",
      quality: "Quality",
      "team care": "Team Care",
      "1:1": "1:1",
      PRP: "PRP",
      "TL/PM feedback": "TL/PM Feedback",
      radar: "Radar",
    };
    this.getElementById("context-value").innerText = contexts[this.feedback.context];

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
    this.getElementById("competency-value").innerText = categories[this.feedback.competency];

    // rating
    for (let i = 1; i <= this.feedback.rating; i++) this.getElementById("star" + i).classList.add("blue-star");

    // messages
    const positiveValue = this.getElementById("positive-value");
    const negativeValue = this.getElementById("negative-value");
    if (this.feedback.user_roles.includes("appraiser")) {
      positiveValue.innerHTML = this.feedback.positive_message;
      negativeValue.innerHTML = this.feedback.negative_message;
    } else {
      // positive
      if (!this.feedback.positive_message_appraiser_edit || this.feedback.positive_message === this.feedback.positive_message_appraiser_edit) {
        positiveValue.innerHTML = this.feedback.positive_message;
      } else {
        positiveValue.innerHTML = this.feedback.positive_message_appraiser_edit;
      }
      // negative
      if (!this.feedback.negative_message_appraiser_edit || this.feedback.negative_message === this.feedback.negative_message_appraiser_edit) {
        negativeValue.innerHTML = this.feedback.negative_message;
      } else {
        negativeValue.innerHTML = this.feedback.negative_message_appraiser_edit;
      }
    }

    // actions
    this.getElementById("actions-value").innerText = this.feedback.actions;

    // responsible
    this.getElementById("responsible-value").innerText = this.feedback.responsible_name;

    // status
    this.getElementById("status-value").innerText = this.feedback.status;

    // deadline
    const deadline = formatDate(new Date(this.feedback.deadline));
    this.getElementById("deadline-value").innerText = deadline.substring(0, deadline.indexOf(" "));

    // messages appraiser edit
    this.getElementById("appraiser-positive-value").innerHTML = this.feedback.positive_message_appraiser_edit;
    this.getElementById("appraiser-negative-value").innerHTML = this.feedback.negative_message_appraiser_edit;

    // appraiser notes
    this.getElementById("appraiser-notes-value").innerHTML = this.feedback.appraiser_notes;
  }

  hideAndDisableOptionsButtons() {
    // unread button
    const unreadButton = this.getElementById("unread-button");
    if (!this.feedback.user_roles.some((role) => ["target", "appraiser", "manager"].includes(role))) unreadButton.style.display = "none"; // the sender will not be shown this option
    else if (!this.feedback.is_read_target && !this.feedback.is_read_appraiser && !this.feedback.is_read_manager) unreadButton.disabled = true; // the feedback was already marked as unread
    else unreadButton.disabled = false;

    // share with appraiser button
    const shareWithAppraiserButton = this.getElementById("share-with-appraiser-button");
    if (!this.feedback.user_roles.includes("sender")) shareWithAppraiserButton.style.display = "none"; // only the sender will be shown this option
    else if (this.feedback.appraiser_visibility) shareWithAppraiserButton.disabled = true; // already shared with appraiser

    // share with manager button
    const shareWithManagerButton = this.getElementById("share-with-manager-button");
    if (!this.feedback.user_roles.includes("appraiser")) shareWithManagerButton.style.display = "none"; // only the appraiser will be shown this option
    else if (this.feedback.manager_visibility) shareWithManagerButton.disabled = true; // already shared with manager

    // share with target button
    const shareWithTargetButton = this.getElementById("share-with-target-button");
    if (!this.feedback.user_roles.includes("appraiser")) shareWithTargetButton.style.display = "none"; // only the appraiser will be shown this option
    else if (this.feedback.target_visibility) shareWithTargetButton.disabled = true; // already shared with target

    // edit button
    const editButton = this.getElementById("edit-button");
    if (!this.feedback.user_roles.some((role) => ["sender", "appraiser"].includes(role))) editButton.style.display = "none"; // only the sender and the appraiser will be shown this option
    else if (this.feedback.user_roles.includes("appraiser")) {
      if (this.feedback.manager_visibility || this.feedback.target_visibility) editButton.disabled = true; // the appraiser already shared with manager or target
    } else if (this.feedback.user_roles.includes("sender") && this.feedback.appraiser_visibility) editButton.disabled = true; // the sender already shared with appraiser

    // delete button
    const deleteButton = this.getElementById("delete-button");
    if (!this.feedback.user_roles.includes("sender")) deleteButton.style.display = "none"; // only the sender will be shown this option
    else if (!this.feedback.can_delete) deleteButton.disabled = true; // disable button if delete action is not legal
  }

  addEventListeners() {
    // unread button
    const unreadButton = this.getElementById("unread-button");
    unreadButton.addEventListener("click", async () => {
      if (this.feedback.user_roles.includes("target")) await this.updateIsRead("target", false);
      if (this.feedback.user_roles.includes("appraiser")) await this.updateIsRead("appraiser", false);
      if (this.feedback.user_roles.includes("manager")) await this.updateIsRead("manager", false);
      this.hideAndDisableOptionsButtons();
    });

    // share with appraiser button
    const shareWithAppraiserButton = this.getElementById("share-with-appraiser-button");
    shareWithAppraiserButton.addEventListener("click", async () => {
      if (!(await this.getConfirmation("shareAppraiser"))) return;
      this.feedback.appraiser_visibility = true;
      const url = "feedbacks/" + this.queryParams.id + "/visibility/appraiser";
      await RequestManager.request("PUT", url, { value: true });
      this.hideAndDisableOptionsButtons();
    });

    // share with manager button
    const shareWithManagerButton = this.getElementById("share-with-manager-button");
    shareWithManagerButton.addEventListener("click", async () => {
      if (!(await this.getConfirmation("shareManager"))) return;
      this.feedback.manager_visibility = true;
      const url = "feedbacks/" + this.queryParams.id + "/visibility/manager";
      await RequestManager.request("PUT", url, { value: true });
      this.hideAndDisableOptionsButtons();
    });

    // share with target button
    const shareWithTargetButton = this.getElementById("share-with-target-button");
    shareWithTargetButton.addEventListener("click", async () => {
      if (!(await this.getConfirmation("shareTarget"))) return;
      this.feedback.target_visibility = true;
      const url = "feedbacks/" + this.queryParams.id + "/visibility/target";
      await RequestManager.request("PUT", url, { value: true });
      this.hideAndDisableOptionsButtons();
    });

    // edit button
    const editButton = this.getElementById("edit-button");
    //TODO: edit button handler

    // delete button
    const deleteButton = this.getElementById("delete-button");
    deleteButton.addEventListener("click", async () => {
      if (this.feedback.can_delete && (await this.getConfirmation("delete"))) {
        await RequestManager.request("DELETE", "feedbacks/" + this.queryParams.id);
        // close tab
        const routePath = window.location.hash.substring(2);
        const tab = new Tabs().getTab(routePath);
        tab.close();
      }
    });
  }

  /**
   * create a confirmation window for the given action
   * @param {string} action can be "shareAppraiser", "shareManager", "shareTarget" or "delete"
   */
  async getConfirmation(action) {
    // helper function
    const getFirstName = (fullName) => {
      return fullName.substring(0, fullName.indexOf(" "));
    };

    const confirmations = {
      shareAppraiser: {
        title: "Share feedback with Appraiser",
        message: "Are you sure you want to share this feedback with <b>" + this.feedback.appraiser_name + "</b>?<br/>This action is irreversible.<br/>You won't be able to edit any fields or delete the feedback after this action.",
        cancelMsg: "Cancel",
        confirmMsg: "Share",
      },
      shareManager: {
        title: "Share feedback with Manager",
        message: "Are you sure you want to share this feedback with <b>" + this.feedback.manager_name + "</b>?<br/>This action is irreversible.<br/>If you edited any fields, " + getFirstName(this.feedback.manager_name) + " will only see their edited version, not the original.<br/>You won't be able to edit any fields after this action.",
        cancelMsg: "Cancel",
        confirmMsg: "Share",
      },
      shareTarget: {
        title: "Share feedback with Target",
        message: "Are you sure you want to share this feedback with <b>" + this.feedback.target_name + "</b>?<br/>This action is irreversible.<br/>If you edited any fields, " + getFirstName(this.feedback.target_name) + " will only see their edited version, not the original.<br/>You won't be able to edit any fields after this action.",
        cancelMsg: "Cancel",
        confirmMsg: "Share",
      },
      delete: {
        title: "Delete Feedback",
        message: "Are you sure you want to delete this feedback?<br/>This action is irreversible",
        cancelMsg: "Cancel",
        confirmMsg: "Delete",
      },
    };

    if (!Object.keys(confirmations).includes(action)) return false;
    return await new ConfirmationWindow().show(confirmations[action].title, confirmations[action].message, confirmations[action].cancelMsg, confirmations[action].confirmMsg);
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
    const access = super.hasAccess();
    if (access) return true; // user is admin
    if (this.feedback.user_roles.includes("sender")) return true; // user is the sender
    if (this.feedback.user_roles.includes("target") && this.feedback.target_visibility) return true; // user is the target and has visibility
    if (this.feedback.user_roles.includes("appraiser") && this.feedback.appraiser_visibility) return true; // user is the appraiser and has visibility
    if (this.feedback.user_roles.includes("manager") && this.feedback.manager_visibility) return true; // user is the manager and has visibility
    return false;
  }
}
