"use strict";

import LocalizedMessages from "../localized-messages/localized-messages.js";
import { throwError } from "../modules/errors/errors.js";
import Tabs from "../modules/tabs/tabs.js";

import HomeComponent from "../components/home/home.component.js";
import MyAppraiseesComponent from "../components/my-appraisees/my-appraisees.component.js";
import SubmitFeedbackComponent from "../components/submit-feedback/submit-feedback.component.js";
import NotFoundComponent from "../components/not-found/not-found.component.js";
import NoAccessComponent from "../components/no-access/no-access.component.js";
import CompareDEEActionsListComponent from "../components/compare-dee-actions-list/compare-dee-actions-list.component.js";
import CompareConfigurationsListComponent from "../components/compare-configurations-list/compare-configurations-list.component.js";
import ShellLandingPageAdministrationComponent from "../components/shell-landingpage-administration/shell-landingpage-administration.component.js";
import PageExampleComponent from "../components/shell-landingpage-example/shell-landingpage-example.component.js";
import TestComponentComponent from "../components/test-component/test-component.component.js";
import Ex1Component from "../components/ex1/ex1.component.js";
import Ex2Component from "../components/ex2/ex2.component.js";
import Ex3Component from "../components/ex3/ex3.component.js";
import Ex4Component from "../components/ex4/ex4.component.js";
import Ex5Component from "../components/ex5/ex5.component.js";

/**
 * Routing table mapping routes to components for dynamic loading.
 */
const Routes = {
  Home: HomeComponent,
  MyAppraisees: MyAppraiseesComponent,
  SubmitFeedback: SubmitFeedbackComponent,
  Administration: ShellLandingPageAdministrationComponent,
  CompareDEEActionsList: CompareDEEActionsListComponent,
  CompareConfigurationsList: CompareConfigurationsListComponent,
  PageExample: PageExampleComponent,
  TestComponent: TestComponentComponent,
  Ex1: Ex1Component,
  Ex2: Ex2Component,
  Ex3: Ex3Component,
  Ex4: Ex4Component,
  Ex5: Ex5Component,
};

/**
 * Renders a HTML page from the route present in the current URL hash.
 */
function renderRoute() {
  if (window.location.hash != null && window.location.hash.startsWith("#/")) {
    let routePath = window.location.hash.substring(2); // Remove the '#/' prefix

    // Query Parameters
    let hash = routePath;
    let queryParams = "";
    let indexQuestionMark = hash.indexOf("?");
    if (indexQuestionMark > -1) {
      queryParams = hash.substring(indexQuestionMark + 1);
      hash = hash.substring(0, indexQuestionMark); // Support query string
    }

    // Tabs logic
    const tabsManager = new Tabs();
    const tabToOpen = tabsManager.getTab(routePath);
    // If tab already exists for the current route (including query parameters)
    if (tabToOpen) {
      // Switch to the already existing tab (without calling component's onInit())
      // Hide currently open tab (if any)
      if (tabsManager.currentlyOpenTab) tabsManager.currentlyOpenTab.hide();
      tabsManager.currentlyOpenTab = tabToOpen;
      // Open the new tab
      tabToOpen.open();
    }
  } else {
    throwError(LocalizedMessages.invalid_url_path);
  }
}

// /**
//  * Injects a component in the DOM and calls onInit().
//  * @param {*} _hash component's routePath hash (URL)
//  * @param {*} _mainContentElement DOM container element to inject the component into
//  */
// function injectComponent(_hash, _mainContentElement) {
//     const pageLabelElement = this.getElementById('page-label');
//     const pageIconElement = this.getElementById('page-icon');
//     // Component injection logic
//     const RoutedComponentType = Routes[_hash] || NotFoundComponent; // Default to NotFoundComponent if route not found
//     const component = new RoutedComponentType(); // Instantiate the component
//     component.render()
//         .then(html => {
//             // Inject HTML, page title and page icon
//             if (_mainContentElement) _mainContentElement.innerHTML = html;
//             if (pageLabelElement) pageLabelElement.innerText = component.pageTitle;
//             if (pageIconElement) pageIconElement.innerHTML = `<span><i class="fa ${component.pageIcon}" aria-hidden="true"></i></span>`;
//             component.onInit();
//         }) // Render the component
//         .catch(error => throwError(error));
// }

/**
 * Redirect to a new page based on a provided route path.
 * @param {*} routePath route path (URL) to redirect to.
 * @param {*} isToOpenInNewTab whether to open the page in a new tab or in the current one.
 */
function redirect(routePath, isToOpenInNewTab, userAccess, _onSuccess) {
  const tabsManager = new Tabs();
  const tabToOpen = tabsManager.getTab(routePath);
  // If it is to open the page in a new tab and the tab doesn't yet exist for the provided routePath
  if (isToOpenInNewTab) {
    if (tabToOpen) {
      // Switch to that already open tab
      _onSuccess();
    } else {
      // Default to NotFoundComponent if route not found
      let RoutedComponentType = Routes[stripURLQueryParameters(routePath)] || NotFoundComponent;
      // Check access
      let component = new RoutedComponentType();
      if (!component.access.includes(userAccess)) {
        RoutedComponentType = NoAccessComponent;
      }
      // Setting the created instance reference to null to make it eligeble for garbage collection
      component = null;
      // Create new tab for the provided routePath, calling component's onInit()
      tabsManager.createTab(routePath, RoutedComponentType, (tab) => {
        if (tab?.tabElement)
          tab.tabElement.onclick = (e) => {
            window.location.href = "#/" + routePath;
          };
        _onSuccess();
      });
    }
  }
}

function stripURLQueryParameters(url) {
  if (url && url.indexOf("?") >= 0) {
    url = url.substring(0, url.indexOf("?"));
  }
  return url;
}

function getAccessibleComponents(userAccess) {
  let accessibleComponents = [];
  const keys = Object.keys(Routes);
  keys.forEach((key) => {
    let component = new Routes[key]();
    if (component.access.includes(userAccess)) {
      accessibleComponents.push({ title: component.pageTitle, href: key });
    }
    component = null;
  });
  return accessibleComponents;
}

/**
 * Builds a URL-encoded string corresponding to a dictionary of query parameters.
 * Examples:
 * buildURL('CompareDEEs', {'name': 'SyncRecupLots'}) = '#/CompareDEEs?name=SyncRecupLots'
 * buildURL('CompareDEEs', {'name': 'SyncRecupLots', 'env1': 'IMEC', 'env2': 'IKEA'}) = '#/CompareDEEs?name=SyncRecupLots&env1=IMEC&env2=IKEA'
 * buildURL('CompareDEEs', {}) = '#/CompareDEEs'
 * @param {*} baseRoutePath string
 * @param {*} queryParamsMap Map<string, string>
 * @returns URL-encoded string corresponding to a dictionary of query parameters
 */
function buildURL(baseRoutePath, queryParamsMap) {
  let url = "#/" + encodeURIComponent(baseRoutePath);
  if (Object.keys(queryParamsMap).length > 0) {
    let first = true;
    for (const [key, value] of Object.entries(queryParamsMap)) {
      url += first ? "?" : "&";
      first = false;
      url += encodeURIComponent(key) + "=" + encodeURIComponent(value);
    }
  }
  return url;
}

/**
 * Parses a given URL and builds a dictionary of query parameters from it.
 * @param {*} url
 * @returns dictionary of query parameters from the parsed URL
 */
function buildURLMap(url) {
  let queryParamsMap = {};
  if (url != null && url.indexOf("?") >= 0) {
    url = url.substring(url.indexOf("?") + 1);
    const urlSearchParams = new URLSearchParams(url);
    queryParamsMap = Object.fromEntries(urlSearchParams.entries());
  }
  return queryParamsMap;
}

export { renderRoute, redirect, stripURLQueryParameters, buildURL, buildURLMap, getAccessibleComponents };
