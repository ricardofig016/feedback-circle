"use strict";

import NoAccessComponent from "../../components/no-access/no-access.component.js";
import NotFoundComponent from "../../components/not-found/not-found.component.js";
import { buildURLMap } from "../../routes/routes.js";
import formatText from "../../utilities/format-text.js";

class Tab {
  routePath; // Route path (URL) of the tab, serving as a unique identifier for the tab
  tabElement; // DOM tab element
  domContent; // DOM content container
  #RoutedComponentType;
  component; // Component object
  #parentContainer;
  #tabTitle;
  #tabIcon; // Only for square tabs
  #tabSplitter;
  squareTabsRoutePaths = ["Home", "Profile"];

  constructor(_routePath, _RoutedComponentType) {
    this.routePath = _routePath;
    this.#RoutedComponentType = _RoutedComponentType || NotFoundComponent;
    this.#parentContainer = document.getElementById("progress-indicator");
  }

  /**
   * Creates this tab and the associated DOM elements and component.
   * @param {*} _tabId
   * @param {*} _onSuccess
   */
  async create(_tabId) {
    await this.instantiateComponent();
    // Create content
    this.domContent = document.createElement("div");
    this.domContent.id = `main-content${_tabId}`;
    this.domContent.classList.add("main-content");
    this.hide(); // Tab content hidden by default
    this.#parentContainer.appendChild(this.domContent);

    // Tabs for square tabs are different from the others
    if (this.squareTabsRoutePaths.includes(this.routePath)) {
      // Create tab on the tabs bar
      const tabsBar = document.getElementById("tabs-bar");
      this.tabElement = document.createElement("div");
      this.tabElement.classList.add("tab");
      this.tabElement.classList.add("square-tab");
      // Home tab is always the first tab
      if (this.routePath === "Home") tabsBar.insertBefore(this.tabElement, tabsBar.firstChild);
      else tabsBar.appendChild(this.tabElement);
      // Tab left filler
      const tabFillerLeft = document.createElement("div");
      tabFillerLeft.classList.add("square-tab-filler-left");
      this.tabElement.appendChild(tabFillerLeft);
      // Icon
      this.#tabIcon = document.createElement("div");
      this.#tabIcon.innerHTML = '<span><i class="fa ' + this.component.pageIcon + '" aria-hidden="true"></i></span>';
      this.#tabIcon.classList.add("square-tab-icon");
      this.tabElement.appendChild(this.#tabIcon);
      // Tab splitter
      this.#tabSplitter = document.createElement("div");
      this.#tabSplitter.classList.add("square-tab-splitter");
      this.tabElement.appendChild(this.#tabSplitter);
    } else {
      // Create tab on the tabs bar
      const tabsBar = document.getElementById("tabs-bar");
      this.tabElement = document.createElement("div");
      this.tabElement.classList.add("tab");
      this.tabElement.draggable = true;
      tabsBar.appendChild(this.tabElement);
      // Tab left filler
      const tabFillerLeft = document.createElement("div");
      tabFillerLeft.classList.add("tab-filler-left");
      this.tabElement.appendChild(tabFillerLeft);
      // Tab title
      this.#tabTitle = document.createElement("div");
      this.#tabTitle.classList.add("tab-title");
      this.tabElement.appendChild(this.#tabTitle);
      // Close button
      const tabCloseButton = document.createElement("div");
      tabCloseButton.classList.add("tab-close");
      tabCloseButton.innerHTML = "×";
      tabCloseButton.onclick = (e) => {
        e.stopPropagation(); // Prevent click from propagating below (and hence re-opening the tab right after closing it)
        this.close();
      };
      this.tabElement.appendChild(tabCloseButton);
      // Tab splitter
      this.#tabSplitter = document.createElement("div");
      this.#tabSplitter.classList.add("tab-splitter");
      this.tabElement.appendChild(this.#tabSplitter);
    }

    const html = await this.renderComponent();
    // Inject HTML, page title and page icon
    this.domContent.innerHTML = html;
    if (this.#tabTitle) this.#tabTitle.innerText = formatText(this.component.pageTitle, 55);
    await this.component.onInit();
  }

  /**
   * Opens this tab (for switching from another tab).
   */
  open() {
    // Update rendered page icon
    const pageIconElement = document.getElementById("page-icon");
    if (pageIconElement) pageIconElement.innerHTML = `<span><i class="fa ${this.component.pageIcon}" aria-hidden="true"></i></span>`;
    // Update rendered page title
    const pageLabelElement = document.getElementById("page-label");
    if (pageLabelElement) pageLabelElement.innerText = formatText(this.component.pageTitle, 180);
    // Show page content
    this.domContent.style.display = "block";
    // Select page's tab
    if (Tabs.currentlyOpenTab?.tabElement) Tabs.currentlyOpenTab.tabElement.classList.remove("selected");
    if (this.tabElement) this.tabElement.classList.add("selected");
    Tabs.currentlyOpenTab = this;
  }

  /**
   * Hides the current tab's content (for switching to another tab).
   */
  hide() {
    this.domContent.style.display = "none";
  }

  /**
   * Closes this tab, destroying the associated DOM elements and component to free up memory.
   */
  close() {
    const tabsBar = document.getElementById("tabs-bar");
    if (tabsBar) tabsBar.removeChild(this.tabElement);
    if (this.#parentContainer) this.#parentContainer.removeChild(this.domContent);
    delete this.component; // Destroy component to free up memory
    const tabsManager = new Tabs();
    tabsManager.closeTab(this.routePath);
  }

  async instantiateComponent() {
    const queryParams = buildURLMap(this.routePath);
    this.component = new this.#RoutedComponentType(queryParams);
    const access = await this.component.hasAccess();
    if (!access) this.component = new NoAccessComponent(queryParams);
  }

  async renderComponent() {
    this.component.domContent = this.domContent;
    const html = await this.component.render();
    return html;
  }
}

export default class Tabs {
  static #instance; // Singleton instance
  static #tabAutoIncrementId;
  static #tabs; // List of tabs
  static currentlyOpenTab;
  static mousePos = { x: 0, y: 0 };

  constructor() {
    // Singleton logic
    if (Tabs.#instance instanceof Tabs) {
      return Tabs.#instance;
    }

    Tabs.#tabs = [];
    Tabs.#tabAutoIncrementId = 0;

    // Singleton logic
    Tabs.#instance = this;
    return Tabs.#instance;
  }

  getTab(_routePath) {
    const tabIndex = Tabs.#tabs.findIndex((tab) => tab.routePath == _routePath);
    if (tabIndex != -1) return Tabs.#tabs[tabIndex];
    else return null;
  }

  /**
   * Closes the tab identified by the provided route path (URL), if any.
   * @param {*} _routePath
   */
  closeTab(_routePath) {
    // If tab exists, close it
    const tabIndex = Tabs.#tabs.findIndex((tab) => tab.routePath == _routePath);
    if (tabIndex != -1) {
      const tab = Tabs.#tabs[tabIndex];
      // If the tab was the currently open one, switch to the tab immediately to the right (or to the left if none, or back to Home if none)
      if (tab == Tabs.currentlyOpenTab) {
        // If any tab to the right
        if (tabIndex < Tabs.#tabs.length - 1) {
          Tabs.currentlyOpenTab = Tabs.#tabs[tabIndex + 1];
        }
        // If any tab to the left
        else if (tabIndex > 0) {
          Tabs.currentlyOpenTab = Tabs.#tabs[tabIndex - 1];
        }
        // Default to Home
        else {
          Tabs.currentlyOpenTab = Tabs.#tabs[0];
        }
        window.location.href = "#/" + Tabs.currentlyOpenTab.routePath;
      }
      Tabs.#tabs.splice(tabIndex, 1);
    }
  }

  /**
   * Closes all tabs.
   */
  static closeTabs() {
    while (Tabs.#tabs.length > 0) {
      Tabs.#tabs[0].close();
    }
  }

  /**
   * Returns tab identified by the provided route path (URL).
   * @param {*} _routePath
   * @returns tab with the (unique) route path
   */
  getTab(_routePath) {
    const tab = Tabs.#tabs.find((tab) => tab.routePath == _routePath);
    return tab;
  }

  /**
   * Creates a new tab with a provided route path (URL), associated to a given component type.
   * @param {*} _routePath
   * @param {*} _RoutedComponentType
   * @param {*} _onSuccess
   */
  async createTab(_routePath, _RoutedComponentType) {
    let tab = this.getTab(_routePath);
    if (!tab) {
      tab = new Tab(_routePath, _RoutedComponentType);
      await tab.create(Tabs.#tabAutoIncrementId++);
      Tabs.#tabs.push(tab);
      return tab;
    }
  }

  /**
   * Handles the dragstart event: when starting to drag a tab.
   * @param {*} event
   */
  static dragStart(event) {
    const img = new Image();
    img.src = "";
    event.dataTransfer.setDragImage(img, 0, 0);
    event.dataTransfer.setData("text/plain", this.routePath);
    const draggingTab = event.target;
    draggingTab.classList.add("dragging");
  }

  /**
   * Handles the drag event: when the cursor moves while dragging a tab.
   * @param {*} event
   */
  static drag(event) {
    this.mousePos.x = event.clientX;
    this.mousePos.y = event.clientY;
  }

  /**
   * Handles the dragover event: when dragging a tab over another.
   * @param {*} event
   */
  static dragOver(event) {
    event.preventDefault();
    const draggingTab = document.querySelector(".tab.dragging");
    const tabsBar = document.getElementById("tabs-bar");
    const beforeTab = Tabs.getDragBeforeElement(tabsBar);

    if (beforeTab == null) {
      tabsBar.appendChild(draggingTab);
    } else {
      tabsBar.insertBefore(draggingTab, beforeTab);
    }
  }

  /**
   * Finds the element which the dragged tab should be placed after.
   * @param {*} container - The container holding the tabs.
   * @param {*} draggedElement - The currently dragged element.
   * @returns The tab element after which the dragged element should be placed.
   */
  static getDragBeforeElement(container) {
    const draggableTabs = [...container.querySelectorAll(".tab:not(.dragging)")];

    let closestElement = null;
    let closestDistance = Infinity;

    draggableTabs.forEach((child) => {
      const childRect = child.getBoundingClientRect();
      const childRight = childRect.right + childRect.width / 4; // with offset to increase smoothness
      const distance = Math.abs(this.mousePos.x - childRight);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestElement = child;
      }
    });

    const beforeElem = closestElement.nextSibling;
    // Prevent sqauare tabs from being moved
    if (beforeElem && beforeElem.classList.contains("square-tab")) {
      return beforeElem.nextSibling; // return the tab to the right of the square-tab
    }

    return beforeElem;
  }
}
