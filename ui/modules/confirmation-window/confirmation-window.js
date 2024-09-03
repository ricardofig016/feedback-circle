"use strict";

export default class ConfirmationWindow {
  static instance; // Singleton instance

  constructor() {
    if (ConfirmationWindow.instance instanceof ConfirmationWindow) {
      return ConfirmationWindow.instance;
    }

    // Singleton logic
    ConfirmationWindow.instance = this;
    return ConfirmationWindow.instance;
  }

  show(title, message, cancelMsg = "Cancel", confirmMsg = "Confirm") {
    document.getElementById("confirmation-window-container").classList.add("active");
    document.getElementById("confirmation-window-title").innerText = title;
    document.getElementById("confirmation-window-message").innerHTML = message;
    document.getElementById("confirmation-window-cancel-button").innerText = cancelMsg;
    document.getElementById("confirmation-window-confirm-button").innerText = confirmMsg;

    return new Promise((resolve, reject) => {
      const handleButtonClick = (isConfirm) => {
        this.hide();
        resolve(isConfirm);
      };

      document.getElementById("confirmation-window-close-button").onclick = () => handleButtonClick(false);
      document.getElementById("confirmation-window-cancel-button").onclick = () => handleButtonClick(false);
      document.getElementById("confirmation-window-confirm-button").onclick = () => handleButtonClick(true);
    });
  }

  hide() {
    document.getElementById("confirmation-window-container").classList.remove("active");
  }
}
