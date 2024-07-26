"use strict";

//import { getUserId } from "../../database/database.js";
import { RequestManager } from "../requests/requests.js";
import { throwError } from "../errors/errors.js";

export default class Session {
  static #instance; // Singleton instance
  static user;

  constructor() {
    // Singleton logic
    if (Session.#instance instanceof Session) {
      return Session.#instance;
    }

    if (!this.user) {
      this.showAuthSection();
      const authForm = document.getElementById("auth-form");
      authForm.addEventListener("submit", (e) => this.handleSubmit(e));
    }

    // Singleton logic
    Session.#instance = this;
    return Session.#instance;
  }

  showAuthSection() {
    document.getElementById("auth-section").hidden = false;
    document.getElementById("main-section").hidden = true;
  }

  handleSubmit(e) {
    e.preventDefault();

    const email = e.target.querySelector('input[type="email"]').value;
    const password = e.target.querySelector('input[type="password"]').value;

    if (this.authenticate(email, password)) this.showMainSection();
    else {
      alert("Wrong email or password");
    }
  }

  showMainSection() {
    document.getElementById("auth-section").hidden = true;
    document.getElementById("main-section").hidden = false;
  }

  authenticate(email, password) {
    // Temporary authentication
    if (email === "RicardoCastro@criticalmanufacturing.com" && password === "admin") return true;
    else return false;
    /** 
    const userId = getUserId(email);
    if (!userId) throwError(email + " is not a valid email");
    else this.user = getUser(userId);
    */
  }
}
