"use strict";

import BaseComponent from "../base/base.component.js";
import DataGrid from "../../utilities/data-grid.js";
import { RequestManager } from "../../modules/requests/requests.js";
import { buildURL } from "../../routes/routes.js";

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

    const noTeamMembersContainer = this.getElementById("no-team-members");
    noTeamMembersContainer.hidden = true;
    if (!this.teamMembers || this.teamMembers.length === 0) {
      noTeamMembersContainer.hidden = false;
      return;
    }

    const teamMembersGrid = new DataGrid(this.getElementById("team-members-data-grid"));

    this.teamMembers.forEach((teamMember) => {
      console.table(teamMember);

      // Create Row
      const row = new Map();
      // Name Column
      const teamMemberUrl = buildURL("TeamMember", { id: teamMember.user_id });
      const nameLink = "<a href=" + teamMemberUrl + ">" + teamMember.name + "</a>";
      row.set("name", nameLink);
      // Notes Column
      const note = teamMember.team_manager_notes ? teamMember.team_manager_notes : "---";
      row.set("notes", note);
      // Most recent feedback Column
      const feedbackTitle = teamMember.feedback_title ? teamMember.feedback_title : "---";
      row.set("most recent feedback", feedbackTitle);

      // Add Row to Grid
      teamMembersGrid.addRow(row);
    });
    // Render grid
    teamMembersGrid.render();
  }
}
