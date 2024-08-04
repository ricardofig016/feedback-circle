"use strict";

import { getAccessibleComponents, redirect, renderRoute } from "./routes/routes.js";
import Tabs from "./modules/tabs/tabs.js";
import Session from "./modules/session/session.js";

function openBasicTabs(tabs) {
  if (tabs.length === 0) return;
  setTimeout(() => {
    window.location.href = "#/" + tabs.shift();
    openBasicTabs(tabs);
  }, 5);
}

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
function createSidebarItems(user) {
  const sidebarItems = document.getElementById("sidebar-items");
  // admin has access to all components
  const accessibleComponents = getAccessibleComponents(user);
  accessibleComponents.forEach((component) => {
    const anchorElem = document.createElement("a");
    anchorElem.href = "#/" + component.href;
    anchorElem.className = "sidebar-item";
    anchorElem.textContent = component.title;
    sidebarItems.appendChild(anchorElem);
  });
}

window.addEventListener("DOMContentLoaded", async () => {
  new Session().start().then((user) => {
    console.count("index evt listeners");
    createSidebarItems(user);

    setupDragAndDrop();

    // Refresh button event listener
    const pageRefreshElement = document.getElementById("page-refresh");
    if (pageRefreshElement) {
      pageRefreshElement.addEventListener("click", async () => {
        console.count("ev handler");
        await Tabs.currentlyOpenTab.component.refresh();
      });
    }

    // Event listener for hashchange events to dynamically render components.
    // Renders a HTML page from the route present int the current URL hash.
    window.addEventListener("hashchange", async () => {
      if (window.location.hash.length <= 2) {
        redirectToHome();
      } else if (window.location.hash != null && window.location.hash.startsWith("#/")) {
        let routePath = window.location.hash.substring(2); // Remove the '#/' prefix
        await redirect(routePath, true, user);
        renderRoute();
      }
    });

    // Open deafult tabs
    const basicTabs = ["Home", "Profile", "SubmitFeedback", "MyAppraisees", "Appraisee?id=3", "Feedback?id=18"];
    openBasicTabs(basicTabs);
  });
});
