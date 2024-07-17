'use strict';


import { redirect, renderRoute } from "./routes/routes.js";



/**
 * Event listener for hashchange events to dynamically render components.
 * Renders a HTML page from the route present int the current URL hash.
 */
window.addEventListener('hashchange', () => {
    if (window.location.hash.length <= 2) {
        redirectToHome();
    }
    else if (window.location.hash != null && window.location.hash.startsWith('#/')) {
        let routePath = window.location.hash.substring(2); // Remove the '#/' prefix
        redirect(routePath, true, () => renderRoute());
    }
});
window.onload = redirectToHome;


function redirectToHome() {
    window.location.href = '#/Home';
}