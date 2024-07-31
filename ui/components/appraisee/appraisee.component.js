import BaseComponent from "../base/base.component.js";
import { RequestManager } from "../../modules/requests/requests.js";

export default class AppraiseeComponent extends BaseComponent {
  selector = "appraisee";
  pageTitle = "Appraisee";
  pageIcon = "fa-user";
  access = ["admin"];

  onInit() {
    super.onInit();
  }

  render() {
    return new Promise((resolve, reject) => {
      RequestManager.request("GET", "users/id/" + this.queryParams["id"], null, (response) => {
        this.pageTitle = response.name;
        const htmlPath = `components/${this.selector}/${this.selector}.component.html`;
        fetch(htmlPath)
          .then((html) => html.text())
          .then((html) => resolve(html))
          .catch((error) => reject(error));
      });
    });
  }

  hasAccess(user) {
    return new Promise((resolve, reject) => {
      RequestManager.request("GET", "users/id/" + this.queryParams["id"], null, (appraisee) => {
        console.log(appraisee.appraiser_id, user.user_id);
        if (appraisee.appraiser_id === user.user_id) resolve(true);
        resolve(false);
      });
    });
  }
}
