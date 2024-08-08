"use strict";

import { throwError } from "../errors/errors.js";
import LocalizedMessages from "../../localized-messages/localized-messages.js";
import ProgressIndicator from "../progress-indicator/progress-indicator.js";

const Config = {
  protocol: "http",
  host: "localhost",
  port: "5000",
  api: "api/",
};

export class RequestManager {
  /**
   *
   * @param {string} method - can be GET, POST, PUT or DELETE
   * @param {string} requestUrl - the url of the api request after "http://.../api/"
   * @param {string} data - js object to be sent as the body of the request
   * @param {*} onSuccess - fucntion to run on success
   * @param {*} onError - fucntion to run on error
   */
  static async request(method, requestUrl, data) {
    const progressIndicator = new ProgressIndicator(); // Show blurred loading screen
    progressIndicator.show();
    const baseURL = `${Config.protocol}://${Config.host}:${Config.port}/${Config.api}`;
    const url = baseURL + requestUrl;
    const res = await fetch(url, {
      method: method,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: data ? JSON.stringify(data) : null,
    });
    // Check for client/server request errors
    if (!res.ok) {
      let errorToDisplay = "";
      if (res.status >= 400 && res.status < 500) {
        // Client error
        errorToDisplay = ` (${LocalizedMessages.client_error}: ${res.status} - ${res.statusText})`;
      } else if (res.status >= 500 && res.status < 600) {
        // Server error
        errorToDisplay = ` (${LocalizedMessages.server_error}: ${res.status} - ${res.statusText})`;
      } else {
        // Other errors
        errorToDisplay = LocalizedMessages.server_request_failed;
      }
      progressIndicator.hide();
      throwError(errorToDisplay);
    }
    progressIndicator.hide();
    if (res.Error?.length > 0) throwError(res.Error);
    if (res.status === 204) return;
    const jsonData = await res.json();
    return jsonData;
  }
}
