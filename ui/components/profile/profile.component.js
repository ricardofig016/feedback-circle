"use strict";

import { signOut } from "../../index.js";
import { RequestManager } from "../../modules/requests/requests.js";
import BaseComponent from "../base/base.component.js";

export default class ProfileComponent extends BaseComponent {
  selector = "profile";
  pageTitle = "Profile";
  pageIcon = "fa-user";
  access = ["user", "appraiser", "admin"];
  appraiser;

  async onInit(isRefresh = false) {
    super.onInit();

    this.getElementById("name").innerText = this.session.user.name;

    if (this.session.user.appraiser_id) {
      if (!this.appraiser) this.appraiser = await RequestManager.request("GET", "users/id/" + this.session.user.appraiser_id);
      const appraiserLink = this.getElementById("appraiser-link");
      appraiserLink.hidden = false;
      appraiserLink.href = "mailto:" + this.appraiser.email;
      appraiserLink.target = "_blank";
    }

    if (!isRefresh) this.addEventListeners();
  }

  addEventListeners() {
    const signOutButton = this.getElementById("sign-out-button");
    signOutButton.addEventListener("click", signOut);
  }
}
