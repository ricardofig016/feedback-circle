'use strict';

import Icons from "../../utilities/icons.js";


export class ToastManager {
    static #instance; // Singleton instance


    constructor() {
        // Singleton logic
        if (ToastManager.#instance instanceof ToastManager) {
            return ToastManager.#instance;
        }

        this.icon = {
            success: Icons.toast_success,
            error:   Icons.toast_error,
            warning: Icons.toast_warning,
            info:    Icons.toast_info
        }
        this.defaultDuration = {
            success: 5000,   // 5 seconds
            error:   600000, // 10 minutes
            warning: 600000, // 10 minutes
            info:    7500    // 7.5 seconds
        }

        // Singleton logic
        ToastManager.#instance = this;
        return ToastManager.#instance;
    }


    showToast(title, message, toastType, duration) {
        if (!(toastType in this.icon)) toastType = "info"; // default toast type
        if (!duration) duration = this.defaultDuration[toastType]; // default duration
        let toastBox = document.createElement("div");
        toastBox.classList.add("toast", `toast-${toastType}`);
        toastBox.innerHTML = `
            <div class="toast-content-wrapper">
                <div class="toast-icon">${this.icon[toastType]}</div>
                <div class="toast-title"><b>${title}</b></div>
                <div class="toast-message">${message}</div>
                <div class="toast-progress"></div>
            </div>`;

        // Remove old toast if existing
        // let toastPrevious = document.body.querySelector(".toast");
        // if (toastPrevious) toastPrevious.remove();

        // Create new toast
        const toastOverlay = document.getElementById("toast-overlay");
        toastOverlay.appendChild(toastBox);
        
        // Animations
        // const toast = document.body.querySelector(".toast");
        if (duration >= 0) {
            // Toast progress bar animation
            toastBox.querySelector(".toast-progress").style.animationFadeOut = `${duration/1000}s`;

            // Toast fade out timeout
            setTimeout(() => {
                toastBox.classList.add("fadingOut"); // Fade out after the duration
                toastBox.style.cursor = "auto";
            }, duration);
            setTimeout(() => toastBox.remove(), duration + 2000); // Remove from DOM 1 second after fading out
        }

        // Fade out sooner on click
        toastBox.onclick = () => {
            toastBox.classList.add("fadingOut");
            toastBox.style.cursor = "auto";
            setTimeout(() => toastBox.remove(), 1000); // Remove from DOM 1 second after clicking
        };
    }
}