"use strict";

import { ToastManager } from "../../modules/toasts/toasts.js";

export default class BaseComponent {
  selector = "base";
  pageTitle = "Base";
  pageIcon = "";
  access = ["admin"];
  queryParams = "";
  domContent = undefined; // DOM content container

  constructor(_queryParams) {
    this.queryParams = _queryParams;
  }

  /**
   * Called whenever the component is instantiated.
   * When the user switches back to the component's tab, onInit() is not called again (only if the tab is closed and then reopened).
   * Calls onValidateQueryParameters() internally to perform a validation of the query parameters.
   */
  onInit() {
    if (!this.onValidateQueryParameters(this.queryParams)) {
      const toastManager = new ToastManager();
      toastManager.showToast("Error", "Invalid query parameters for the component '" + this.selector + "'.");
    }
  }

  /**
   * Validates the query parameters for the component on the URL.
   * By default returns true, and it is to be overrided by each component.
   * @param {*} _queryParams Map<string, string>
   */
  onValidateQueryParameters(_queryParams) {
    return true;
  }

  /**
   * Renders the component in the page based on its HTML source.
   * @returns Promise
   */
  render() {
    return new Promise((resolve, reject) => {
      const htmlPath = `components/${this.selector}/${this.selector}.component.html`;
      fetch(htmlPath)
        .then((html) => html.text())
        .then((html) => resolve(html))
        .catch((error) => reject(error));
    });
  }

  /**
   * Returns the first DOM element with the provided ID, only within the context of the current component (or null/undefined if none).
   * @param {*} _id
   * @returns DOM element
   */
  getElementById(_id) {
    return this.domContent?.querySelector("#" + _id);
  }

  hasAccess(user) {
    if (this.access.includes(user.role)) return true;
    return false;
  }
}
