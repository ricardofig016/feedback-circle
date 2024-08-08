"use strict";

import { RequestManager } from "../requests/requests.js";
import { ToastManager } from "../toasts/toasts.js";
import { throwError } from "../errors/errors.js";

export default class Session {
  static #instance; // Singleton instance
  static user;

  constructor() {
    // Singleton logic
    if (Session.#instance instanceof Session) {
      return Session.#instance;
    }

    // Singleton logic
    Session.#instance = this;
    return Session.#instance;
  }

  start() {
    return new Promise((resolve, reject) => {
      if (!this.user) {
        this.showAuthSection();
        const authForm = document.getElementById("auth-form");
        authForm.addEventListener(
          "submit",
          async (e) => {
            const user = await this.handleSubmit(e);
            resolve(user);
          },
          { once: true } // auto-remove the event after being triggered once
        );
      } else {
        resolve(this.user);
      }
    });
  }

  showAuthSection() {
    document.getElementById("auth-section").hidden = false;
    document.getElementById("main-section").hidden = true;
  }

  showMainSection() {
    document.getElementById("auth-section").hidden = true;
    document.getElementById("main-section").hidden = false;
  }

  async handleSubmit(e) {
    e.preventDefault();

    const email = e.target.querySelector('input[type="email"]').value;
    const password = e.target.querySelector('input[type="password"]').value;

    const user = await this.authenticate(email, password);
    return user;
  }

  async authenticate(email, password) {
    const url = "users/email/" + email;
    const res = await RequestManager.request("GET", url);
    // TODO: password logic
    this.user = res;
    this.showMainSection();
    return this.user;
  }
}
