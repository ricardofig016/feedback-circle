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
        authForm.addEventListener("submit", (e) => {
          this.handleSubmit(e)
            .then((user) => {
              resolve(user);
            })
            .catch((error) => {
              throw new Error("authentication failed " + error.message);
            });
        });
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

  handleSubmit(e) {
    e.preventDefault();

    const email = e.target.querySelector('input[type="email"]').value;
    const password = e.target.querySelector('input[type="password"]').value;

    return this.authenticate(email, password);
  }

  authenticate(email, password) {
    return new Promise((resolve, reject) => {
      const url = "users/email/" + email;
      RequestManager.request(
        "GET",
        url,
        null,
        (res) => {
          // TODO: password logic
          this.user = res;
          this.showMainSection();
          new ToastManager().showToast("Welcome", "Authentication Succeded", "success", 5000);
          resolve(this.user);
        },
        (error) => {
          alert("Wrong email or password");
          reject(error);
        }
      );
    });
  }
}
