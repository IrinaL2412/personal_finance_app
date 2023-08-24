import {CustomHttp} from "../services/custom-http.js";
import config from "../../config/config.js";
import {Auth} from "../services/auth.js";

export class Main {
    constructor() {
        this.chartOne = null;
        this.chartTwo = null;
        this.operations = [];
        this.operationsIncomeCategory = [];
        this.operationsExpenseCategory = [];
        this.operationsIncomeAmount = [];
        this.operationsExpenseAmount = [];

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
            that.chartOne.destroy();
            that.chartTwo.destroy();
            that.init(interval);
        }

        buttonWeek.onclick = function () {
            const interval = '?period=week';
            that.chartOne.destroy();
            that.chartTwo.destroy();
            that.init(interval);
        }

        buttonMonth.onclick = function () {
            const interval = '?period=month';
            that.chartOne.destroy();
            that.chartTwo.destroy();
            that.init(interval);
        }

        buttonYear.onclick = function () {
            const interval = '?period=year';
            that.chartOne.destroy();
            that.chartTwo.destroy();
            that.init(interval);
        }

        buttonAll.onclick = function () {
            const interval = '?period=all';
            that.chartOne.destroy();
            that.chartTwo.destroy();
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

            function checkDateInputs() {
                const dateStartValueForRequest = buttonDateStart.value.split('.').reverse().join('-');
                const dateEndValueForRequest = buttonDateEnd.value.split('.').reverse().join('-');
                if (buttonDateStart.value.trim() && buttonDateEnd.value.trim()) {
                    that.chartOne.destroy();
                    that.chartTwo.destroy();

                    const interval = '?period=interval' + '&dateFrom=' + dateStartValueForRequest + '&dateTo=' + dateEndValueForRequest;
                    that.init(interval);
                } else {
                }
            }
        });
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

                this.createCharts(this.operations);
            }
        } catch (error) {
            return console.log(error);
        }
    }

    createCharts(operations) {
        const userInfo = Auth.getUserInfo();
        if (!userInfo) {
            location.href = '#/';
        }

        const textInformation1 = document.getElementById('information1');
        const textInformation2 = document.getElementById('information2');

        let chartLeft = document.getElementById('chart-left').getContext('2d');
        chartLeft.canvas.parentElement.style.height = '500px';
        chartLeft.canvas.parentElement.style.width = '521px';


        let chartRight = document.getElementById('chart-right').getContext('2d');
        chartRight.canvas.parentElement.style.height = '500px';
        chartRight.canvas.parentElement.style.width = '521px';


        this.operationsIncomeCategory = operations.filter(operation =>
            operation.type === 'income').map(operation => operation.category);

        this.operationsIncomeAmount = operations.filter(operation =>
            operation.type === 'income').map(operation => operation.amount);

        this.operationsExpenseCategory = operations.filter(operation =>
            operation.type === 'expense').map(operation => operation.category);

        this.operationsExpenseAmount = operations.filter(operation =>
            operation.type === 'expense').map(operation => operation.amount);

        this.operationsIncomeCategory.forEach((item, index, array) => {
            if (item === undefined) {
                array[index] = 'категория удалена';
            }
        })


        if (this.operationsIncomeCategory.length > 0) {
            textInformation1.classList.add('d-none');
        } else {
            textInformation1.classList.remove('d-none');
        }

        if (this.operationsExpenseCategory.length > 0) {
            textInformation2.classList.add('d-none');

        } else {
            textInformation2.classList.remove('d-none');
        }


        let randomColorGenerator = (num) => {
            let colors = [];
            for (let i = 0; i < num; i++) {
                colors.push('#' + Math.floor(Math.random() * 16777215).toString(16));
            }
            return colors;
        };

        let colors = ['#DC3545', '#FD7E14', '#FFC107', '#20C997', '#0D6EFD'];


        this.chartOne = new Chart(chartLeft, {
            type: 'pie',
            data: {
                labels: this.operationsIncomeCategory,
                datasets: [{
                    data: this.operationsIncomeAmount,
                    backgroundColor: colors.slice(0, 5).concat(randomColorGenerator(this.operationsIncomeAmount.length - 5)),
                    borderWidth: 1,
                    radius: 180
                }]
            },
            options: {
                plugins: {
                    legend: {
                        labels: {
                            fontSize: 12,
                        }
                    }
                },
                maintainAspectRatio: true,
            }
        });


        this.chartTwo = new Chart(chartRight, {
            type: 'pie',
            data: {
                labels: this.operationsExpenseCategory,
                datasets: [{
                    data: this.operationsExpenseAmount,
                    backgroundColor: colors.slice(0, 5).concat(randomColorGenerator(this.operationsExpenseAmount.length - 5)),
                    borderWidth: 1,
                    radius: 180
                }]
            },
            options: {
                plugins: {
                    legend: {
                        labels: {
                            fontSize: 12
                        }
                    }
                },
                maintainAspectRatio: true
            },
        });

        this.getBalance();
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

