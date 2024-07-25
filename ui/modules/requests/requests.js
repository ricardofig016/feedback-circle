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
  static request(method, requestPath, data, onSuccess, onError) {
    const progressIndicator = new ProgressIndicator(); // Show blurred loading screen
    progressIndicator.show();
    const baseURL = `${Config.protocol}://${Config.host}:${Config.port}/${Config.api}`;
    const url = baseURL + requestPath;
    fetch(url, {
      method: method,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((res) => {
        // Check for client/server request errors
        progressIndicator.hide();
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
          throw new Error(errorToDisplay);
        }
        return res.json();
      })
      // Process response callback on success
      .then((res) => {
        progressIndicator.hide();
        if (res.Error?.length > 0) throwError(res.Error);
        if (onSuccess) onSuccess(res);
      })
      // Process error callback on fail
      .catch((error) => {
        progressIndicator.hide();
        throwError(error);
        if (onError) onError(error);
      });
  }
}
