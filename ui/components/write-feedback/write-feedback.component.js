"use strict";

import BaseComponent from "../base/base.component.js";
import { RequestManager } from "../../modules/requests/requests.js";
import { ToastManager } from "../../modules/toasts/toasts.js";
import messages from "../../utilities/write-feedback-messages.js";
import debounce from "../../utilities/debounce.js";

export default class WriteFeedbackComponent extends BaseComponent {
  selector = "write-feedback";
  pageTitle = "Write Feedback";
  pageIcon = "fa-pencil";
  access = ["user", "appraiser", "admin"];
  users; // all users NAME, ID and IS_PINNED (in alphabetical order)
  receiver;
  responsible;
  receiverSuggestions = [];
  responsibleSuggestions = [];

  async onInit(isRefresh = false) {
    super.onInit();
    this.users = await RequestManager.request("GET", "users/withpins/userid/" + this.session.user.user_id);
    if (!isRefresh) this.addEventListeners();
  }

  addEventListeners() {
    // Receiver field
    const receiverInput = this.getElementById("receiver-input");
    receiverInput.addEventListener("click", (e) => {
      const dropdown = this.getElementById("receiver-dropdown");
      if (dropdown.hidden) {
        const query = e.target.value.trim();
        this.updateSuggestions(query, "receiver");
      } else dropdown.hidden = true; // hide dropdown on click if the dropdown is not hidden
    });
    receiverInput.addEventListener(
      "input",
      debounce((e) => {
        this.receiver = null;
        const query = e.target.value.trim();
        this.updateSuggestions(query, "receiver");
      }, 300)
    );

    // Responsible field
    const responsibleInput = this.getElementById("responsible-input");
    responsibleInput.addEventListener("click", (e) => {
      const dropdown = this.getElementById("responsible-dropdown");
      if (dropdown.hidden) {
        const query = e.target.value.trim();
        this.updateSuggestions(query, "responsible");
      } else dropdown.hidden = true; // hide dropdown on click if the dropdown is not hidden
    });
    responsibleInput.addEventListener(
      "input",
      debounce((e) => {
        this.responsible = null;
        const query = e.target.value.trim();
        this.updateSuggestions(query, "responsible");
      }, 300)
    );

    // Type field
    const showAndHideTypeDependentElems = (selectedType) => {
      // continuous only elems
      this.getElementsByClassName("continuous-type-only").forEach((elem) => {
        elem.style.display = selectedType === "performance" ? "none" : "";
      });
      // performance only elems
      this.getElementsByClassName("performance-type-only").forEach((elem) => {
        elem.style.display = selectedType === "performance" ? "" : "none";
      });
    };
    const clearContextField = () => {
      const contextInput = this.getElementById("context-input");
      contextInput.value = "";
    };
    const performanceRadio = this.getElementById("performance-radio");
    performanceRadio.addEventListener("change", () => {
      showAndHideTypeDependentElems("performance");
      clearContextField();
    });
    const continuousRadio = this.getElementById("continuous-radio");
    continuousRadio.addEventListener("change", () => {
      showAndHideTypeDependentElems("continuous");
      clearContextField();
    });

    // Rating field
    const starLabels = this.getElementsByClassName("star-label");
    starLabels.forEach((label) => {
      label.addEventListener("click", (e) => {
        // deselect all stars
        this.getElementsByClassName("star-input").forEach((star) => {
          star.checked = false;
        });
        // select the corresponding radio
        const radio = this.getElementById(e.target.getAttribute("for"));
        radio.checked = true;
      });
    });

    // Reset fields' tooltip messages on click
    const fields = Object.keys(messages);
    fields.forEach((field) => {
      // Add default tooltip messages on input fields
      const icon = messages[field]["defaultInfo"]["icon"];
      const text = messages[field]["defaultInfo"]["text"];
      this.sendTooltipMessage(field, icon, text, "default");
      const fieldInput = this.getElementById(field + "-input");
      fieldInput.addEventListener("click", () => {
        // Set warning/error messages on input fields to default info messages
        this.sendTooltipMessage(field, icon, text, "default");
      });
    });

    // Save button
    const saveButton = this.getElementById("save-form-button");
    saveButton.addEventListener("click", async () => {
      const formData = this.getFormData();
      if (!this.validateFormData(formData)) return false;
      await this.postFeedback(formData, false);
    });

    // Share button
    const shareButton = this.getElementById("share-form-button");
    shareButton.addEventListener("click", async () => {
      const formData = this.getFormData();
      if (!this.validateFormData(formData)) return false;
      await this.postFeedback(formData, true);
    });
  }

  /**
   * update name suggestions
   *
   * @param {string} query value inserted to the input
   * @param {string} field a text field that supports name search (receiver or responsible)
   */
  updateSuggestions(query, field) {
    this.calcSuggestions(query, field);
    const suggestionsContainer = this.getElementById(field + "-dropdown");
    suggestionsContainer.innerHTML = ""; // Clear previous suggestions
    suggestionsContainer.hidden = false;

    this[field + "Suggestions"].forEach((suggestion) => {
      // create suggestion
      const suggContainer = document.createElement("div");
      suggContainer.className = "suggestion-container";
      suggContainer.dataset.user_id = suggestion.user_id;

      const suggItem = document.createElement("div");
      suggItem.className = "suggestion-item";
      suggItem.innerHTML = "<span>" + suggestion.name + "</span>";
      suggContainer.appendChild(suggItem);

      const suggIcon = document.createElement("div");
      suggIcon.className = "suggestion-icon";
      const heartMode = suggestion.is_pinned ? "fa-bookmark" : "fa-bookmark-o";
      suggIcon.innerHTML = "<i class='fa fa-2x " + heartMode + "'></i>";
      suggContainer.appendChild(suggIcon);

      suggestionsContainer.appendChild(suggContainer);

      // clicking a suggestion
      suggItem.addEventListener("click", () => {
        this[field] = suggestion;
        this.getElementById(field + "-input").value = suggestion.name;
        suggestionsContainer.innerHTML = ""; // clear suggestions
        suggestionsContainer.hidden = true;
      });

      // clicking a pin icon
      suggIcon.addEventListener("click", (e) => {
        e.stopPropagation();
        const container = e.target.classList.contains("suggestion-icon") ? e.target.parentElement : e.target.parentElement.parentElement;
        this.users.forEach(async (user) => {
          // clicked user
          if (user.user_id == container.dataset.user_id) {
            const newIsPinned = !user.is_pinned;
            // update client, database and suggestions
            user.is_pinned = newIsPinned;
            await RequestManager.request("PUT", "users/updatepin/" + this.session.user.user_id + "/" + user.user_id, { newIsPinned });
            this.updateSuggestions(this.getElementById(field + "-input").value.trim(), field);
          }
        });
      });
    });
  }

  // filter suggestions
  calcSuggestions(query, field) {
    if (!query) {
      this[field + "Suggestions"] = this.users;
      this.sortSuggestions(field);
      return;
    }
    query = query.toLowerCase();
    const firstNameStartsWithQuery = [];
    const otherNameStartsWithQuery = [];
    const containsQuery = [];

    this.users.forEach((user) => {
      const lowerCaseName = user.name.toLowerCase();
      const names = lowerCaseName.split(" ");

      if (lowerCaseName.startsWith(query)) {
        firstNameStartsWithQuery.push(user);
      } else if (names.filter((name) => name.startsWith(query)).length > 0) {
        otherNameStartsWithQuery.push(user);
      } else if (lowerCaseName.includes(query)) {
        containsQuery.push(user);
      }

      if (query === lowerCaseName) this[field] = user;
    });

    this[field + "Suggestions"] = [...firstNameStartsWithQuery, ...otherNameStartsWithQuery, ...containsQuery];
    this.sortSuggestions(field);
  }

  sortSuggestions(field) {
    this[field + "Suggestions"].sort((a, b) => {
      if (a.is_pinned === b.is_pinned) {
        return 0; // preserve order
      }
      return a.is_pinned ? -1 : 1; // if a is pinned and b isnt, a should come first
    });
  }

  async postFeedback(formData, isShare) {
    const data = {
      senderId: this.session.user.user_id,
      receiverId: this.receiver.user_id,
      title: this.receiver.name + " - " + formData.context,
      positiveMessage: formData.positive,
      positiveMessageAppraiserEdit: formData.positive,
      negativeMessage: formData.negative,
      negativeMessageAppraiserEdit: formData.negative,
      competency: formData.competency,
      privacy: formData.privacy,
      rating: formData.rating,
      type: formData.type,
      context: formData.context,
      actions: formData.actions,
      responsibleId: formData.type === "continuous" ? this.responsible.user_id : null,
      status: formData.status,
      deadline: formData.deadline,
      senderVis: true,
      appraiserVis: isShare,
      receiverVis: false,
      teamManagerVis: false,
    };
    console.table(data);
    await RequestManager.request("POST", "feedbacks", data);
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
    const unvalidate = (field, message) => {
      // tooltip
      const icon = messages[field][message]["icon"];
      const text = messages[field][message]["text"];
      this.sendTooltipMessage(field, icon, text, "icon");
      // unvalidate form data
      validation = false;
    };

    let validation = true;

    // normal fields ( type, context, competency, privacy, rating )
    ["type", "context", "competency", "privacy", "rating"].forEach((field) => {
      if (!formData[field]) unvalidate(field, "missing");
    });

    // positive, negative
    if (!formData.positive && !formData.negative) unvalidate("positive", "missing"); // at least one field between positive and negative is required

    // receiver
    if (!formData.receiver) unvalidate("receiver", "missing"); // missing value
    else if (!this.receiver) unvalidate("receiver", "invalid"); // invalid receiver
    else if (this.session.user.user_id === this.receiver.user_id) unvalidate("receiver", "selfFeedback"); // the user cant make a feedback about themselves

    // responsible
    if (formData.type === "continuous") {
      if (!formData.responsible) unvalidate("responsible", "missing"); // missing value
      else if (!this.responsible) unvalidate("responsible", "invalid"); // invalid responsible
    }

    // status
    if (formData.type === "continuous" && !formData.status) unvalidate("status", "missing"); // missing value

    // failed form submission toast
    if (!validation) new ToastManager().showToast("Warning", "Please correct the highlighted fields before submitting", "warning", 5000);

    return validation;
  }

  /**
   * Sends a validation message to a specific field.
   *
   * @param {string} field - The form field to which the validation message applies.
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

  resetAllTooltipMessages() {
    const fields = Object.keys(messages);
    fields.forEach((field) => {
      const icon = messages[field]["defaultInfo"]["icon"];
      const text = messages[field]["defaultInfo"]["text"];
      this.sendTooltipMessage(field, icon, text, "default");
    });
  }
}
