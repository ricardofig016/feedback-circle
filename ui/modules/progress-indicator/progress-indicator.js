"use strict";

export default class ProgressIndicator {
  static #progressIndicatorElement;
  static #progressIndicatorLoadingElement;
  static #instance; // Singleton instance

  constructor() {
    if (ProgressIndicator.#instance instanceof ProgressIndicator) {
      return ProgressIndicator.#instance;
    }

    ProgressIndicator.#progressIndicatorElement = document.getElementById("progress-indicator");
    ProgressIndicator.#progressIndicatorLoadingElement = document.getElementById("progress-indicator-loading");

    // Singleton logic
    ProgressIndicator.#instance = this;
    return ProgressIndicator.#instance;
  }

  show() {
    if (ProgressIndicator.#progressIndicatorElement) {
      ProgressIndicator.#progressIndicatorElement.classList.add("active");
    }
    if (ProgressIndicator.#progressIndicatorLoadingElement) {
      ProgressIndicator.#progressIndicatorLoadingElement.classList.add("active");
    }
  }

  hide() {
    setTimeout(() => {
      if (ProgressIndicator.#progressIndicatorElement) {
        ProgressIndicator.#progressIndicatorElement.classList.remove("active");
      }
      if (ProgressIndicator.#progressIndicatorLoadingElement) {
        ProgressIndicator.#progressIndicatorLoadingElement.classList.remove("active");
      }
    }, 100);
  }
}
