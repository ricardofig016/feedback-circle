import { RequestManager } from "../../modules/requests/requests.js";
import { ToastManager } from "../../modules/toasts/toasts.js";
import { throwError } from "../../modules/errors/errors.js";


export class SelectEnvironments {
    #environmentsSelected; // Left and right environments
    #environmentsAll; // All environment
    #dropdownSelectorEnvironments; // DOM selectors
    #compareButton; // DOM compare button


    /**
     * Initialize component and controls after rendering the HTML.
     */
    init(_selectEnvironmentsBox, _compareButtonCallback) {
        this.#environmentsSelected = [undefined, undefined];
        this.#dropdownSelectorEnvironments = [_selectEnvironmentsBox.querySelector("#select-environments-input-select-environment1-name"), _selectEnvironmentsBox.querySelector("#select-environments-input-select-environment2-name")];
        this.#compareButton = _selectEnvironmentsBox.querySelector("#select-environments-button-compare");

        // Handle onclick and onchange logic
        for (let i = 0; i < this.#dropdownSelectorEnvironments.length; i++) {
            const selectEnvironment = this.#dropdownSelectorEnvironments[i];
            selectEnvironment.onclick = (e) => {
                if (this.#environmentsAll == null) {
                    this.#fetchAllEnvironments();
                }
            }
            selectEnvironment.onchange = (e) => {
                this.setSelectedEnvironment(i, selectEnvironment.value);
                this.#updateButtonCompareDisabledState();
            }
        }
        if (this.#compareButton) {
            this.#compareButton.onclick = (e) => _compareButtonCallback();
        }
    }


    /**
     * Renders the select environments component, injecting the HTML into the region.
     */
    render(_selectEnvironmentsBox, _compareButtonCallback) {
        const htmlSelector = 'select-environments';
        const htmlPath = `components/${htmlSelector}/${htmlSelector}.component.html`;
        fetch(htmlPath)
            .then(html => html.text())
            .then(html => {
                if (_selectEnvironmentsBox) {
                    _selectEnvironmentsBox.innerHTML = html;
                    this.init(_selectEnvironmentsBox, _compareButtonCallback);
                }
            })
            .catch(error => throwError(error));
    }


    /**
     * Updates the disabled state of the 'Compare' button.
     */
    #updateButtonCompareDisabledState() {
        let areAllEnvironmentsSelected = true;
        for (const selectedEnvironment of this.#environmentsSelected) areAllEnvironmentsSelected &= selectedEnvironment != null;
        if (areAllEnvironmentsSelected) this.#compareButton.removeAttribute('disabled');
        else this.#compareButton.disabled = true;
    }


    /**
     * Obtains a list of all the environments available by making a server request and populates all the selects in the DOM.
     */
    #fetchAllEnvironments() {
        RequestManager.request("GetAllEnvironmentEntries", {}, (res) => {
            this.#environmentsAll = res.EnvironmentEntries;
            for (const selectEnvironment of this.#dropdownSelectorEnvironments) {
                // Clear existing options
                selectEnvironment.innerHTML = '';
                // Populate all the selects in the DOM
                // Default empty option
                const nodeOptionDefault = document.createElement("option");
                nodeOptionDefault.style.display = 'none';
                selectEnvironment.appendChild(nodeOptionDefault.cloneNode(true));
                // Environments obtained from the server
                for (let idx = 0; idx < this.#environmentsAll.length; idx++) {
                    const nodeOption = document.createElement("option");
                    nodeOption.value = nodeOption.innerText = this.#environmentsAll[idx].Name;
                    selectEnvironment.appendChild(nodeOption.cloneNode(true));
                }
            }
        });
    }


    /**
     * Getter for #environments.
     * @param {*} _idx 
     */
    getSelectedEnvironment(_idx) {
        let environment = null;
        if (this.#environmentsSelected?.length > _idx) environment = this.#environmentsSelected[_idx];
        else new ToastManager().showToast("Error", `Error trying to get nonexisting environment ${_idx}`, "error");
        return environment;
    }


    /**
     * Setter for #environments.
     * @param {*} _idx 
     * @param {*} _environment 
     */
    setSelectedEnvironment(_idx, _environment) {
        if (this.#environmentsSelected?.length > _idx) this.#environmentsSelected[_idx] = _environment;
        else new ToastManager().showToast("Error", `Error trying to set nonexisting environment ${_idx}`, "error");
    }
}