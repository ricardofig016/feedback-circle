"use strict";

import { getAccessibleComponents, redirect, renderRoute } from "./routes/routes.js";
import Tabs from "./modules/tabs/tabs.js";
import Session from "./modules/session/session.js";

async function openBasicTabs(routes) {
  for (let i = 0; i < routes.length; i++) {
    const route = routes[i];
    window.location.href = "#/" + route;
    // Manually open the basic tab
    await redirect(route, true);
    renderRoute();
  }
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
function createSidebarItems() {
  const sidebarItems = document.getElementById("sidebar-items");
  // admin has access to all components
  const accessibleComponents = getAccessibleComponents();
  accessibleComponents.forEach((component) => {
    const anchorElem = document.createElement("a");
    anchorElem.href = "#/" + component.href;
    anchorElem.className = "sidebar-item";
    anchorElem.textContent = component.title;
    sidebarItems.appendChild(anchorElem);
  });
}

async function hashChangeHandler() {
  if (!new Session().user) return;
  if (window.location.hash.length <= 2) {
    redirectToHome();
  } else if (window.location.hash != null && window.location.hash.startsWith("#/")) {
    let routePath = window.location.hash.substring(2); // Remove the '#/' prefix
    await redirect(routePath, true);
    renderRoute();
  }
}

export async function signOut() {
  // Delete user
  new Session().user = null;
  // Close tabs
  Tabs.closeTabs();
  // Delete sidebar items
  document.getElementById("sidebar-items").replaceChildren();
  // Redirect to Home tab
  redirectToHome();
  // Remove hashchange event listener
  window.removeEventListener("hashchange", hashChangeHandler);
  // Restart
  await start();
}

async function start() {
  // Wait for sign in
  const session = new Session();
  await session.start();

  createSidebarItems();

  // Open deafult tabs
  // TODO: remove everything except Home and Profile
  const basicTabs = ["Home", "Profile", "MyAppraisees", "Appraisee?id=10639"];
  await openBasicTabs(basicTabs);

  // Event listener for hashchange events to dynamically render components.
  // Renders a HTML page from the route present int the current URL hash.
  window.addEventListener("hashchange", hashChangeHandler);
}

window.addEventListener(
  "DOMContentLoaded",
  async () => {
    await start();

    setupDragAndDrop();

    // Refresh button event listener
    const pageRefreshElement = document.getElementById("page-refresh");
    if (pageRefreshElement) {
      pageRefreshElement.addEventListener("click", async () => {
        await Tabs.currentlyOpenTab.component.refresh();
      });
    }
  },
  { once: true }
);
