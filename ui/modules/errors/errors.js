"use strict";

import { ToastManager } from "../toasts/toasts.js";

export function throwError(error) {
  new ToastManager().showToast("Error", error, "error"); // Show toast with error
  throw new Error(error); // Throw error to the console (to ease debugging)
}
