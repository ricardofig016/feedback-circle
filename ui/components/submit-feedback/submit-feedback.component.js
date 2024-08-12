"use strict";

import BaseComponent from "../base/base.component.js";
import { RequestManager } from "../../modules/requests/requests.js";
import { ToastManager } from "../../modules/toasts/toasts.js";
import messages from "../../utilities/submit-feedback-messages.js";

export default class SubmitFeedbackComponent extends BaseComponent {
  selector = "submit-feedback";
  pageTitle = "Submit Feedback";
  pageIcon = "fa-pencil";
  access = ["user", "appraiser", "admin"];

  onInit(isRefresh = false) {
    super.onInit();
    if (!isRefresh) this.addEventListeners();
  }

  addEventListeners() {
    // Submit button
    const submitButton = this.getElementById("submit-form-button");
    submitButton.addEventListener("click", () => {
      const formData = this.getFormData();
      if (!this.validateFormData(formData)) return false;
      this.postFeedback(formData);
    });

    const fields = Object.keys(messages);
    fields.forEach((field) => {
      // Add default tooltip messages on input fields
      const icon = messages[field]["defaultInfo"]["icon"];
      const message = messages[field]["defaultInfo"]["text"];
      this.sendTooltipMessage(field, icon, message, "default");
      const fieldInput = this.getElementById(field + "-input");
      fieldInput.addEventListener("click", () => {
        // Set warning/error messages on input fields to default info messages
        this.sendTooltipMessage(field, icon, message, "default");
      });
    });
  }

  async postFeedback(formData) {
    const data = {
      senderId: this.session.user.user_id,
      receiverId: 3, //TODO:
      title: formData["title"],
      positiveMessage: formData["positive"],
      negativeMessage: formData["negative"],
      category: formData["category"],
      privacy: formData["privacy"],
      rating: formData["rating"],
    };
    console.table(data);
    const res = await RequestManager.request("POST", "feedbacks", data);
    console.table(res);
    new ToastManager().showToast("Success", "Feedback submited", "success", 5000);
  }

  getFormData() {
    const formData = {};
    const fields = Object.keys(messages);
    fields.forEach((field) => {
      formData[field] = this.getInputFieldValue(field);
    });
    return formData;
  }

  getInputFieldValue(field) {
    const inputElem = this.getElementById(field + "-input");
    // Radio inputs
    if (inputElem.classList.contains("form-radio") || inputElem.classList.contains("form-rating")) {
      // Find the selected radio
      const selectedRadio = inputElem.querySelector('input[name="' + field + '"]:checked');
      if (selectedRadio && selectedRadio.value) return selectedRadio.value;
    }
    // The rest of the input types
    if (inputElem && inputElem.value) return inputElem.value;
    // No value found
    return null;
  }

  validateFormData(formData) {
    let validation = true;

    const fields = Object.keys(messages);
    fields.forEach((field) => {
      // Missing value
      if (!formData[field]) {
        if (!["positive", "negative"].includes(field) || (!formData["positive"] && !formData["negative"])) {
          // Tooltip
          const icon = messages[field]["missingValue"]["icon"];
          const message = messages[field]["missingValue"]["text"];
          this.sendTooltipMessage(field, icon, message, "icon");
          // Toast
          if (field !== "negative") new ToastManager().showToast("Warning", message, "warning", 5000);
          // Unvalidate form data
          validation = false;
        }
      }
    });

    if (formData.title && formData.title.length > 120) {
      const icon = "warning";
      const message = "<p>The title is too long (" + formData["title"].length + "/120)</p>";
      this.sendTooltipMessage("title", icon, message, "icon");
      new ToastManager().showToast("Warning", message, "warning", 5000);
    }

    return validation;
  }

  /**
   * Sends a validation message for a specific field.
   *
   * @param {string} field - The field to which the validation message applies. Can be "name", "category", "type", "privacy" or "body".
   * @param {string} icon - The type of validation message. Can be "check", "error", "warning", or "info".
   * @param {string} message - The validation message to display or "none" to keep the previous message.
   * @param {string} border - The color of the border of the correspondend input element. Can be  "icon" for the same color as the icon or "default" for default.
   */
  sendTooltipMessage(field, icon, message = "none", border = "default") {
    const iconClassName = {
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
    iconElem.className = "fa fa-" + iconClassName[icon];
    // Border
    const inputElem = this.getElementById(field + "-input");
    if (border === "icon") {
      inputElem.style.outlineColor = "#" + colors[icon];
      inputElem.style.outlineWidth = "2px";
    } else if (border === "default") {
      inputElem.style.outlineColor = "rgba(0, 0, 0, 0.5)";
      inputElem.style.outlineWidth = "1px";
    }
    // Message
    if (message != "none") {
      const tooltipElem = this.getElementById(field + "-tooltip");
      tooltipElem.innerHTML = message;
    }
  }
}
