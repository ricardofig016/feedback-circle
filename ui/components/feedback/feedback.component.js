"use strict";

import BaseComponent from "../base/base.component.js";
import { RequestManager } from "../../modules/requests/requests.js";
import formatText from "../../utilities/format-text.js";

export default class FeedbackComponent extends BaseComponent {
  selector = "feedback";
  pageTitle = "Feedback";
  pageIcon = "fa-tag";
  access = ["admin"];
  feedback;
  receiver;

  onInit() {
    super.onInit();
  }

  async render() {
    if (!this.feedback) this.feedback = await RequestManager.request("GET", "feedbacks/id/" + this.queryParams.id);
    this.pageTitle = this.feedback.title;
    return super.render();
  }

  async hasAccess() {
    if (!this.feedback) this.feedback = await RequestManager.request("GET", "feedbacks/id/" + this.queryParams.id);
    const receiverId = this.feedback.receiver_id;
    if (!this.receiver) this.receiver = await RequestManager.request("GET", "users/id/" + receiverId);
    const access = super.hasAccess();
    if (access) return true; // user is admin
    if (this.receiver.appraiser_id === this.session.user.user_id) return true; // user is the appraiser
    if (this.receiver.user_id === this.session.user.user_id && this.feedback.visibility === "both") return true; // user is the receiver and has visibility
    return false;
  }
}
