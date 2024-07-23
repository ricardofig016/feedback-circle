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

    const submitButton = this.getElementById("submit-button");
    submitButton.onclick = (e) => {
      this.serverRequest();
    };
  }

  serverRequest() {
    // Retrieve form data
    const formData = {
      name: this.getElementById("name-input").value,
      type: this.getElementById("type-input").value,
      evaluation: this.getElementById("evaluation-input").value,
      body: this.getElementById("body-input").value,
    };

    // Validation
    if (!this.validateFormData(formData)) return false;

    // Request
    RequestManager.request("GetActionsFromMultipleEnvironments", formData, (responseData) => {});
  }

  validateFormData(data) {
    let validation = true;

    if (!data["name"]) {
      this.sendValidationMessage("name", "warning", "You must input the name of the appraisee", "icon");
      validation = false;
    }
    if (!data["type"]) {
      this.sendValidationMessage("type", "warning", "You must select a type", "icon");
      validation = false;
    }
    if (!data["evaluation"]) {
      this.sendValidationMessage("evaluation", "warning", "You must select an evaluation", "icon");
      validation = false;
    }
    if (!data["body"]) {
      this.sendValidationMessage("body", "warning", "You must input the body", "icon");
      validation = false;
    }

    return validation;
  }

  /**
   * Sends a validation message for a specific field.
   *
   * @param {string} field - The field to which the validation message applies. Can be "name", "type", "evaluation" or "body".
   * @param {string} icon - The type of validation message. Can be "check", "error", "warning", or "info".
   * @param {string} message - The validation message to display or none to keep the previous message.
   * @param {string} border - The color of the border of the correspondend input element. Can be  "icon" for the same color as the icon or "default" for default
   */
  sendValidationMessage(field, icon, message = "none", border = "deafult") {
    const iconClass = {
      check: "check-circle",
      error: "exclamation-circle",
      warning: "exclamation-triangle",
      info: "info-circle",
    };
    const colors = {
      check: "50b450",
      error: "ea4232",
      warning: "f69414",
      info: "3498db",
    };
    // Icon
    const iconElem = this.getElementById(field + "-icon");
    iconElem.className = "fa fa-" + iconClass[icon];
    // Border
    if (border === "icon") {
      const inputElem = this.getElementById(field + "-input");
      inputElem.style.borderColor = "#" + colors[icon];
      inputElem.style.borderWidth = "2px";
    } else if (border === "default") {
      inputElem.style.borderColor = "rgba(0, 0, 0, 0.5)";
      inputElem.style.borderWidth = "1px";
    }
    // Message
    if (message != "none") {
      const tooltipElem = this.getElementById(field + "-tooltip");
      tooltipElem.textContent = message;
    }
  }
}
