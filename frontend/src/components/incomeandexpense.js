import {CustomHttp} from "../services/custom-http.js";
import config from "../../config/config.js";
import {Auth} from "../services/auth.js";


export class Incomeandexpense {
    constructor() {
        this.operations = null;
        this.table = null;
        this.balance = document.getElementById('balance');

        this.init('');

        new AirDatepicker('#date-from', {
            position: 'right top'
        });

        new AirDatepicker('#date-to', {
            position: 'right top'
        });

        const that = this;
        const buttonToday = document.getElementById('button-today');
        const buttonWeek = document.getElementById('button-week');
        const buttonMonth = document.getElementById('button-month');
        const buttonYear = document.getElementById('button-year');
        const buttonAll = document.getElementById('button-all');
        const buttonInterval = document.getElementById('button-interval');
        const buttonDateStart = document.getElementById('date-from');
        const buttonDateEnd = document.getElementById('date-to');
        const buttons = Array.from(document.getElementsByClassName('interval-btn'));
        const createIncomeButton = document.getElementById('create-income');
        const createExpenseButton = document.getElementById('create-expense');

        createIncomeButton.onclick = function () {
            localStorage.setItem('category', 'income');
            location.href = '#/createincomeorexpense';
        }

        createExpenseButton.onclick = function () {
            localStorage.setItem('category', 'expense');
            location.href = '#/createincomeorexpense';
        }

        buttons.forEach(button => {
            button.addEventListener('click', () => {
                buttonDateStart.setAttribute('disabled', 'disabled');
                buttonDateEnd.setAttribute('disabled', 'disabled');
                buttons.forEach(btn => {
                    btn.classList.remove('btn-secondary');
                    btn.classList.add('btn-outline-secondary');
                });
                button.classList.add('btn-secondary');
                button.classList.remove('btn-outline-secondary');
            })
        });

        buttonToday.onclick = function () {
            const interval = '';
            that.init(interval);
        }

        buttonWeek.onclick = function () {
            const interval = '?period=week';
            that.init(interval);
        }

        buttonMonth.onclick = function () {
            const interval = '?period=month';
            that.init(interval);
        }

        buttonYear.onclick = function () {
            const interval = '?period=year';
            that.init(interval);
        }

        buttonAll.onclick = function () {
            const interval = '?period=all';
            that.init(interval);
        }

        buttonInterval.addEventListener('click', function () {
            buttonDateStart.removeAttribute('disabled');
            buttonDateEnd.removeAttribute('disabled');

            buttonDateStart.addEventListener('focusout', function () {
                const previousValue = buttonDateStart.getAttribute('data-previous-value');
                const currentValue = buttonDateStart.value;

                if (previousValue !== currentValue) {
                    buttonDateStart.setAttribute('data-previous-value', currentValue);
                    checkDateInputs();
                }
            });

            buttonDateEnd.addEventListener('focusout', function () {
                const previousValue = buttonDateEnd.getAttribute('data-previous-value');
                const currentValue = buttonDateEnd.value;

                if (previousValue !== currentValue) {
                    buttonDateEnd.setAttribute('data-previous-value', currentValue);
                    checkDateInputs();
                }
            });
        });

        function checkDateInputs() {
            const dateStartValueForRequest = buttonDateStart.value.split('.').reverse().join('-');
            const dateEndValueForRequest = buttonDateEnd.value.split('.').reverse().join('-');

            if (buttonDateStart.value.trim() && buttonDateEnd.value.trim()) {
                const interval = '?period=interval' + '&dateFrom=' + dateStartValueForRequest + '&dateTo=' + dateEndValueForRequest;
                that.init(interval);
            }
        }
    }

    async init(interval) {

        const userInfo = Auth.getUserInfo();
        if (!userInfo) {
            location.href = '#/';
        }

        try {
            const result = await CustomHttp.request(config.host + '/operations' + interval);

            if (result) {
                if (result.error) {
                    throw new Error(result.error);
                }
                this.operations = result;
                this.renderOperations(this.operations);
            }
        } catch (error) {
            return console.log(error);
        }
    }

    renderOperations(operations) {

        this.table = document.getElementById('table');

        const textInformation = document.getElementById('information');

        if (operations.length > 0) {
            this.table.classList.remove('d-none');
            textInformation.classList.add('d-none');

        } else {
            this.table.classList.add('d-none');
            textInformation.classList.remove('d-none');
        }

        const tableBodyElement = document.getElementById('table-body');
        tableBodyElement.innerHTML = '';

        operations.forEach((operation, index) => {
            const that = this;

            const tableRowElement = document.createElement('tr');
            tableRowElement.className = 'text-center';

            const tableRowNumber = document.createElement('th');
            tableRowNumber.setAttribute('scope', 'row');
            tableRowNumber.innerText = index + 1;

            const tableTypeOfCategory = document.createElement('td');
            if (operation.type === 'income') {
                tableTypeOfCategory.innerText = 'доход';
                tableTypeOfCategory.style.color = '#198754';
            } else {
                tableTypeOfCategory.innerText = 'расход';
                tableTypeOfCategory.style.color = '#DC3545';
            }

            const operationId = operation.id;
            const tableElementOfCategory = document.createElement('td');

            if (operation.category) {
                tableElementOfCategory.innerText = operation.category;
            } else {
                tableElementOfCategory.innerText = 'категория удалена';
                tableElementOfCategory.style.color = '#DC3545';
                tableElementOfCategory.style.fontStyle = 'italic';
                tableElementOfCategory.style.fontSize = '0.9rem';
            }

            const tableAmountOfCategory = document.createElement('td');
            tableAmountOfCategory.innerText = operation.amount + '$';

            const tableDateOfCategory = document.createElement('td');
            tableDateOfCategory.innerText = operation.date.split('-').reverse().join('.');

            const tableCommentOfCategory = document.createElement('td');
            tableCommentOfCategory.innerText = operation.comment;

            const tableEditButtons = document.createElement('td');
            tableEditButtons.className = 'text-end';

            const tableDeleteButton = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            tableDeleteButton.setAttributeNS(null, 'width', '14');
            tableDeleteButton.setAttributeNS(null, 'height', '15');
            tableDeleteButton.setAttributeNS(null, 'viewBox', '0 0 14 15');
            tableDeleteButton.setAttribute('role', 'button');
            tableDeleteButton.setAttribute('data-bs-toggle', 'modal');
            tableDeleteButton.setAttribute('data-bs-target', '#staticBackdrop');
            tableDeleteButton.onclick = function () {
                const buttonDelete = document.getElementById('button-confirm');
                buttonDelete.onclick = function () {
                    that.removeOperation(operationId, this);
                    tableRowElement.remove();
                }
            };

            const tableDeleteButtonPath1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            tableDeleteButtonPath1.setAttributeNS(null, 'd', 'M4.5 5.5C4.77614 5.5 5 5.72386 5 6V12C5 12.2761 4.77614 12.5 4.5 12.5C4.22386 12.5 4 12.2761 4 12V6C4 5.72386 4.22386 5.5 4.5 5.5Z');
            tableDeleteButton.appendChild(tableDeleteButtonPath1);

            const tableDeleteButtonPath2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            tableDeleteButtonPath2.setAttributeNS(null, 'd', 'M7 5.5C7.27614 5.5 7.5 5.72386 7.5 6V12C7.5 12.2761 7.27614 12.5 7 12.5C6.72386 12.5 6.5 12.2761 6.5 12V6C6.5 5.72386 6.72386 5.5 7 5.5Z');
            tableDeleteButton.appendChild(tableDeleteButtonPath2);

            const tableDeleteButtonPath3 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            tableDeleteButtonPath3.setAttributeNS(null, 'd', 'M10 6C10 5.72386 9.77614 5.5 9.5 5.5C9.22386 5.5 9 5.72386 9 6V12C9 12.2761 9.22386 12.5 9.5 12.5C9.77614 12.5 10 12.2761 10 12V6Z');
            tableDeleteButton.appendChild(tableDeleteButtonPath3);

            const tableDeleteButtonPath4 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            tableDeleteButtonPath4.setAttributeNS(null, 'fill-rule', 'evenodd');
            tableDeleteButtonPath4.setAttributeNS(null, 'clip-rule', 'evenodd');
            tableDeleteButtonPath4.setAttributeNS(null, 'd', 'M13.5 3C13.5 3.55228 13.0523 4 12.5 4H12V13C12 14.1046 11.1046 15 10 15H4C2.89543 15 2 14.1046 2 13V4H1.5C0.947715 4 0.5 3.55228 0.5 3V2C0.5 1.44772 0.947715 1 1.5 1H5C5 0.447715 5.44772 0 6 0H8C8.55229 0 9 0.447715 9 1H12.5C13.0523 1 13.5 1.44772 13.5 2V3ZM3.11803 4L3 4.05902V13C3 13.5523 3.44772 14 4 14H10C10.5523 14 11 13.5523 11 13V4.05902L10.882 4H3.11803ZM1.5 3V2H12.5V3H1.5Z');
            tableDeleteButton.appendChild(tableDeleteButtonPath4);

            const tableEditButton = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            tableEditButton.setAttributeNS(null, 'width', '16');
            tableEditButton.setAttributeNS(null, 'height', '16');
            tableEditButton.setAttributeNS(null, 'viewBox', '0 0 16 16');
            tableEditButton.setAttribute('role', 'button');
            tableEditButton.onclick = function () {
                localStorage.setItem('operationType', tableTypeOfCategory.innerText);
                localStorage.setItem('operationCategory', tableElementOfCategory.innerText);
                localStorage.setItem('operationAmount', tableAmountOfCategory.innerText);
                localStorage.setItem('operationDate', tableDateOfCategory.innerText);
                localStorage.setItem('operationComment', tableCommentOfCategory.innerText);
                localStorage.setItem('operationId', operationId);
                that.editOperation(this);
            }

            const tableEditButtonPath1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            tableEditButtonPath1.setAttributeNS(null, 'd', 'M12.1465 0.146447C12.3417 -0.0488155 12.6583 -0.0488155 12.8536 0.146447L15.8536 3.14645C16.0488 3.34171 16.0488 3.65829 15.8536 3.85355L5.85357 13.8536C5.80569 13.9014 5.74858 13.9391 5.68571 13.9642L0.68571 15.9642C0.500001 16.0385 0.287892 15.995 0.146461 15.8536C0.00502989 15.7121 -0.0385071 15.5 0.0357762 15.3143L2.03578 10.3143C2.06092 10.2514 2.09858 10.1943 2.14646 10.1464L12.1465 0.146447ZM11.2071 2.5L13.5 4.79289L14.7929 3.5L12.5 1.20711L11.2071 2.5ZM12.7929 5.5L10.5 3.20711L4.00001 9.70711V10H4.50001C4.77616 10 5.00001 10.2239 5.00001 10.5V11H5.50001C5.77616 11 6.00001 11.2239 6.00001 11.5V12H6.29291L12.7929 5.5ZM3.03167 10.6755L2.92614 10.781L1.39754 14.6025L5.21903 13.0739L5.32456 12.9683C5.13496 12.8973 5.00001 12.7144 5.00001 12.5V12H4.50001C4.22387 12 4.00001 11.7761 4.00001 11.5V11H3.50001C3.28561 11 3.10272 10.865 3.03167 10.6755Z');
            tableEditButton.appendChild(tableEditButtonPath1);

            tableBodyElement.appendChild(tableRowElement);
            tableRowElement.appendChild(tableRowNumber);
            tableRowElement.appendChild(tableTypeOfCategory);
            tableRowElement.appendChild(tableElementOfCategory);
            tableRowElement.appendChild(tableAmountOfCategory);
            tableRowElement.appendChild(tableDateOfCategory);
            tableRowElement.appendChild(tableCommentOfCategory);
            tableRowElement.appendChild(tableEditButtons);
            tableEditButtons.appendChild(tableDeleteButton);
            tableEditButtons.appendChild(tableEditButton);
        });

        this.getBalance();
    }

    async removeOperation(id) {
        try {
            const result = await CustomHttp.request(config.host + '/operations/' + id, 'DELETE');

            if (result) {
                if (result.error) {
                    throw new Error(result.error);
                }

                this.getBalance();
            }
        } catch (error) {
            return console.log(error);
        }
    }

    editOperation() {
        location.href = '#/editincomeorexpense';
    }

    async getBalance() {
        try {
            const result = await CustomHttp.request(config.host + '/balance');

            if (result) {
                if (result.error) {
                    throw new Error(result.error);
                }
                this.balance.innerText = result.balance;
            }
        } catch (error) {
            return console.log(error);
        }
    }
}