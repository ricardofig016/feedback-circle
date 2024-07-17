'use strict';

export default class DataGrid {
    domElement; // DOM Element associated to the table
    columns;
    rows;
    pageSize; // Pagination: number of rows per page
    page; // Pagination: current page number (0-based)

    /**
     * Initializes a DataGrid and registers it to a DOM Element.
     * @param {DOMElement} _domElement - DOM Element to register the table to
     */
    constructor(_domElement) {
        this.domElement = _domElement;
        this.columns = [];
        this.rows = [];
        this.pageSize = 100;
        this.page = 0;
    }

    /**
     * Adds a row to the DataGrid.
     * @param {Map<string, string>} row - Dictionary mapping column names (keys) to values (HTML code)
     */
    addRow(row) {
        // Merge columns: include new columns
        for (const col of row.keys()) {
            if (!(this.columns.includes(col))) this.columns.push(col);
        }
        // Add new row with all the updated columns and render the table in the GUI
        this.rows.push(row);
        // Add the new columns to all the rows already inserted and to the new row
        for (let i = 0; i < this.rows.length; i++) {
            for (const col of this.columns) {
                if (!this.rows[i].has(col)) this.rows[i].set(col, null);
            }
        }
    }

    /**
     * Renders the DataGrid to the DOM Element, destroying the previous structure.
     */
    render() {
        if (this.domElement) {
            this.domElement.classList.add('data-grid-container');
            this.domElement.textContent = '';
            
            const pagination = document.createElement('div');
            pagination.classList.add('data-grid-pagination');
            pagination.style.display = 'flex';
            pagination.style.alignItems = 'center';
            pagination.style.gap = '24px';
            this.domElement.append(pagination);

            const paginationRowsPerPage = document.createElement('div');
            paginationRowsPerPage.innerText = `Rows per page: ${this.pageSize}`;
            pagination.append(paginationRowsPerPage);

            const paginationPage = document.createElement('div');
            pagination.append(paginationPage);
            // paginationPage.style.display = 'flex';
            // paginationPage.style.alignItems = 'center';
            // paginationPage.style.gap = '12px';
            const numberOfPages = Math.ceil(this.rows.length / this.pageSize);
            paginationPage.innerHTML = `Page <b>${this.page + 1}</b> of <b>${numberOfPages}</b><br>(${this.rows.length} rows)`;
            paginationPage.style.marginBottom = '8px';

            const paginationPageButtonPrevious = document.createElement('span');
            pagination.append(paginationPageButtonPrevious);
            paginationPageButtonPrevious.classList.add('data-grid-pagination-button-page');
            paginationPageButtonPrevious.innerHTML = '<i class="fa fa-chevron-left" aria-hidden="true"></i>';
            if (this.page > 0) {
                paginationPageButtonPrevious.classList.add('data-grid-pagination-button-page-active');
                paginationPageButtonPrevious.onclick = (e) => {
                    this.page--;
                    this.render();
                }
            }

            const paginationPageButtonNext = document.createElement('span');
            pagination.append(paginationPageButtonNext);
            paginationPageButtonNext.classList.add('data-grid-pagination-button-page');
            paginationPageButtonNext.innerHTML = '<i class="fa fa-chevron-right" aria-hidden="true"></i>';
            if (this.page < numberOfPages - 1) {
                paginationPageButtonNext.classList.add('data-grid-pagination-button-page-active');
                paginationPageButtonNext.onclick = (e) => {
                    this.page++;
                    this.render();
                }
            }

            const table = document.createElement('table');
            this.domElement.append(table);
            table.classList.add('data-grid');
            
            if (this.columns.length > 0) {
                // Header columns
                let tr = document.createElement('tr');
                table.appendChild(tr);
                for (const col of this.columns) {
                    const th = document.createElement('th');
                    tr.appendChild(th);
                    th.innerHTML = col ?? '';
                }
                // Rows
                const startRow = this.pageSize * this.page;
                const endRow = Math.min(this.rows.length - 1, this.pageSize * (this.page + 1) - 1);
                for (let i = startRow; i <= endRow; i++) {
                    const row = this.rows[i];
                    tr = document.createElement('tr');
                    table.appendChild(tr);
                    for (const col of this.columns) {
                        const td = document.createElement('td');
                        tr.appendChild(td);
                        td.innerHTML = row.get(col) ?? '';
                    }
                }
            }
        }
    }
}