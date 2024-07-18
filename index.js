"use strict";

import { redirect, renderRoute } from "./routes/routes.js";
import Tabs from "../modules/tabs/tabs.js";

function redirectToHome() {
  window.location.href = "#/Home";
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

window.addEventListener("DOMContentLoaded", () => {
  // Event listener for hashchange events to dynamically render components.
  // Renders a HTML page from the route present int the current URL hash.
  setupDragAndDrop();
  window.addEventListener("hashchange", () => {
    if (window.location.hash.length <= 2) {
      redirectToHome();
    } else if (window.location.hash != null && window.location.hash.startsWith("#/")) {
      let routePath = window.location.hash.substring(2); // Remove the '#/' prefix
      redirect(routePath, true, () => renderRoute());
    }
  });
  window.onload = redirectToHome;
});
