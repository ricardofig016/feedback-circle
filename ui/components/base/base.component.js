"use strict";

import Session from "../../modules/session/session.js";
import { ToastManager } from "../../modules/toasts/toasts.js";

export default class BaseComponent {
  selector = "base";
  pageTitle = "Base";
  pageIcon = "";
  access = ["admin"];
  queryParams = "";
  domContent = undefined; // DOM content container
  session;

  constructor(_queryParams) {
    this.queryParams = _queryParams;
    this.session = new Session();
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
  async render() {
    const htmlPath = `components/${this.selector}/${this.selector}.component.html`;
    const html = await fetch(htmlPath);
    const htmlText = html.text();
    return htmlText;
  }

  /**
   * Returns the first DOM element with the provided ID, only within the context of the current component (or null/undefined if none).
   * @param {*} _id
   * @returns DOM element
   */
  getElementById(_id) {
    return this.domContent?.querySelector("#" + _id);
  }

  /**
   * Returns all of the DOM elements with the provided class, only within the context of the current component (or null/undefined if none).
   * @param {*} _class
   * @returns DOM element
   */
  getElementsByClassName(_class) {
    return Array.from(this.domContent?.querySelectorAll("." + _class) || []);
  }

  hasAccess() {
    if (this.access.includes(this.session.user.access)) return true;
    else return false;
  }

  refresh() {
    this.onInit(true);
  }
}
