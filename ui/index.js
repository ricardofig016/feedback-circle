"use strict";

import { getAccessibleComponents, redirect, renderRoute } from "./routes/routes.js";
import Tabs from "./modules/tabs/tabs.js";
import Session from "./modules/session/session.js";
import { throwError } from "./modules/errors/errors.js";

function redirectToHome() {
  const prevHash = window.location.hash;
  window.location.href = "#/Home";
  // Manually trigger the hashchange event when the Hash does not change on refresh
  if (prevHash === "#/Home") {
    const manualHashchangeEvent = new Event("hashchange");
    window.dispatchEvent(manualHashchangeEvent);
  }
}

// Add drag and drop event listeners to the tabs bar
function setupDragAndDrop() {
  const tabsBar = document.getElementById("tabs-bar");
  tabsBar.addEventListener("dragstart", (event) => Tabs.dragStart(event));
  tabsBar.addEventListener("drag", (event) => Tabs.drag(event));
  tabsBar.addEventListener("dragover", (event) => Tabs.dragOver(event));
  tabsBar.addEventListener("dragenter", (event) => event.preventDefault());
  tabsBar.addEventListener("dragleave", (event) => event.preventDefault());
  tabsBar.addEventListener("dragend", (event) => {
    event.preventDefault();
    const draggingTab = document.querySelector(".tab.dragging");
    draggingTab.classList.remove("dragging");
  });
}

// Create sidebar items based on the acess of the user
function createSidebarItems(userAccess) {
  const sidebarItems = document.getElementById("sidebar-items");
  // admin has access to all components
  const accessibleComponents = getAccessibleComponents(userAccess);
  accessibleComponents.forEach((component) => {
    const anchorElem = document.createElement("a");
    anchorElem.href = "#/" + component.href;
    anchorElem.className = "sidebar-item";
    anchorElem.textContent = component.title;
    sidebarItems.appendChild(anchorElem);
  });
}

window.addEventListener("DOMContentLoaded", () => {
  new Session().start().then((user) => {
    createSidebarItems(user.role);

    setupDragAndDrop();

    // Event listener for hashchange events to dynamically render components.
    // Renders a HTML page from the route present int the current URL hash.
    window.addEventListener("hashchange", () => {
      if (window.location.hash.length <= 2) {
        redirectToHome();
      } else if (window.location.hash != null && window.location.hash.startsWith("#/")) {
        let routePath = window.location.hash.substring(2); // Remove the '#/' prefix
        redirect(routePath, true, user.role, () => renderRoute());
      }
    });

    redirectToHome();

    // REMOVE: For development purposes only
    setTimeout(() => {
      window.location.href = "#/SubmitFeedback";
    });
  });
});
