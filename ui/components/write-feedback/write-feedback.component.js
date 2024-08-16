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
  suggestions = [];
  receiverId;

  async onInit(isRefresh = false) {
    super.onInit();
    this.users = await RequestManager.request("GET", "users/withpins/userid/" + this.session.user.user_id);
    if (!isRefresh) this.addEventListeners();
  }

  addEventListeners() {
    // Name field
    const nameInput = this.getElementById("name-input");
    nameInput.addEventListener("click", (e) => {
      const dropdown = this.getElementById("suggestions-dropdown");
      if (dropdown.hidden) {
        const query = e.target.value.trim();
        this.updateSuggestions(query);
      } else dropdown.hidden = true; // hide dropdown on click if the dropdown is not hidden
    });
    nameInput.addEventListener(
      "input",
      debounce((e) => {
        this.receiverId = null;
        const query = e.target.value.trim();
        this.updateSuggestions(query);
      }, 300)
    );

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
      const message = messages[field]["defaultInfo"]["text"];
      this.sendTooltipMessage(field, icon, message, "default");
      const fieldInput = this.getElementById(field + "-input");
      fieldInput.addEventListener("click", () => {
        // Set warning/error messages on input fields to default info messages
        this.sendTooltipMessage(field, icon, message, "default");
      });
    });

    // Save button
    const saveButton = this.getElementById("save-form-button");
    saveButton.addEventListener("click", async () => {
      const formData = this.getFormData();
      if (!this.validateFormData(formData)) return false;
      await this.postFeedback(formData, "sender");
    });

    // Share button
    const shareButton = this.getElementById("share-form-button");
    shareButton.addEventListener("click", async () => {
      const formData = this.getFormData();
      if (!this.validateFormData(formData)) return false;
      await this.postFeedback(formData, "appraiser");
    });
  }

  // update name suggestions
  updateSuggestions(query) {
    this.calcSuggestions(query);
    const suggestionsContainer = this.getElementById("suggestions-dropdown");
    suggestionsContainer.innerHTML = ""; // Clear previous suggestions
    suggestionsContainer.hidden = false;

    this.suggestions.forEach((suggestion) => {
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
      const heartMode = suggestion.is_pinned ? "fa-heart" : "fa-heart-o";
      suggIcon.innerHTML = "<i class='fa fa-2x " + heartMode + "'></i>";
      suggContainer.appendChild(suggIcon);

      suggestionsContainer.appendChild(suggContainer);

      // clicking a suggestion
      suggItem.addEventListener("click", () => {
        this.receiverId = suggestion.user_id;
        this.getElementById("name-input").value = suggestion.name;
        suggestionsContainer.innerHTML = ""; // Clear suggestions
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
            this.updateSuggestions(this.getElementById("name-input").value.trim());
          }
        });
      });
    });
  }

  // filter name suggestions
  calcSuggestions(query) {
    if (!query) {
      this.suggestions = this.users;
      this.sortSuggestions();
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

      if (query === lowerCaseName) this.receiverId = user.user_id;
    });

    this.suggestions = [...firstNameStartsWithQuery, ...otherNameStartsWithQuery, ...containsQuery];
    this.sortSuggestions();
  }

  sortSuggestions() {
    this.suggestions.sort((a, b) => {
      if (a.is_pinned === b.is_pinned) {
        return 0; // preserve order
      }
      return a.is_pinned ? -1 : 1; // if a is pinned and b isnt, a should come first
    });
  }

  async postFeedback(formData, visibility) {
    const data = {
      senderId: this.session.user.user_id,
      receiverId: this.receiverId,
      title: formData.title,
      positiveMessage: formData.positive,
      positiveMessageAppraiserEdit: formData.positive,
      negativeMessage: formData.negative,
      negativeMessageAppraiserEdit: formData.negative,
      category: formData.category,
      visibility,
      privacy: formData.privacy,
      rating: formData.rating,
    };
    const res = await RequestManager.request("POST", "feedbacks", data);
    //console.table(res);
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

    // missing receiverId
    if (!this.receiverId) {
      const message = "Invalid name";
      this.sendTooltipMessage("name", "warning", message, "icon");
      new ToastManager().showToast("Warning", message, "warning", 5000);
    }

    // the user cant make a feedback about himself
    if (this.session.user.user_id === this.receiverId) {
      const message = "You can't make a feedback about yourself";
      this.sendTooltipMessage("name", "warning", message, "icon");
      new ToastManager().showToast("Warning", message, "warning", 5000);
    }

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

    // Title too long
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
