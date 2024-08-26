"use strict";

import BaseComponent from "../base/base.component.js";
import DataGrid from "../../utilities/data-grid.js";
import { RequestManager } from "../../modules/requests/requests.js";
import { buildURL } from "../../routes/routes.js";
import Session from "../../modules/session/session.js";
import { throwError } from "../../modules/errors/errors.js";
import formatText from "../../utilities/format-text.js";

export default class MyTeamComponent extends BaseComponent {
  selector = "my-team";
  pageTitle = "My Team";
  pageIcon = "fa-users";
  access = ["team_manager", "admin"];
  teamMembers;

  async onInit() {
    super.onInit();

    // Team Members request
    const url = "users/teammanagerid/" + this.session.user.user_id;
    this.teamMembers = await RequestManager.request("GET", url);

    const noTeamMembersSection = this.getElementById("no-team-members-section");
    noTeamMembersSection.hidden = true;
    if (!this.teamMembers || this.teamMembers.length === 0) {
      noTeamMembersSection.hidden = false;
      return;
    }

    const teamMembersGrid = new DataGrid(this.getElementById("team-members-data-grid"));

    this.teamMembers.forEach((teamMember) => {
      console.table(teamMember);

      // Create Row
      const row = new Map();
      // Name Column
      const teamMemberUrl = buildURL("TeamMember", { id: teamMember.user_id });
      const nameLink = "<a href=" + teamMemberUrl + ">" + formatText(teamMember.name) + "</a>";
      row.set("name", nameLink);
      // Notes Column
      const note = teamMember.team_manager_notes ? formatText(teamMember.team_manager_notes) : "---";
      row.set("notes", note);
      // Most recent feedback Column
      const feedbackTitle = teamMember.feedback_title ? formatText(teamMember.feedback_title) : "---";
      row.set("most recent feedback", feedbackTitle);

      // Add Row to Grid
      teamMembersGrid.addRow(row);
    });
    // Render grid
    teamMembersGrid.render();
  }
}
