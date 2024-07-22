"use strict";

import BaseComponent from "../base/base.component.js";
import { RequestManager } from "../../modules/requests/requests.js";
import { ToastManager } from "../../modules/toasts/toasts.js";

export default class SubmitFeedbackComponent extends BaseComponent {
  selector = "submit-feedback";
  pageTitle = "Submit Feedback";
  pageIcon = "fa-pencil";

  onInit() {
    super.onInit();

    // Server request
    const submitButton = this.getElementById("submit-button");
    submitButton.onclick = (e) => {
      // Data to send to the server
      const formData = {
        appraisee: this.getElementById("name-input").value,
        type: this.getElementById("type-select").value,
        evaluation: this.getElementById("evaluation-select").value,
        body: this.getElementById("body-textarea").value,
      };
      console.log(formData);
      RequestManager.request("GetActionsFromMultipleEnvironments", formData, (responseData) => {});
    };
  }

  validateFormData(data) {
    return true;
  }
}
