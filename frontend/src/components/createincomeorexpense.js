import {CustomHttp} from "../services/custom-http.js";
import config from "../../config/config.js";
import {Auth} from "../services/auth.js";
// import AirDatepicker from "air-datepicker";
// import 'air-datepicker/air-datepicker.css'

export class CreateCategories {
    constructor() {
        this.buttonCreateElement = null;
        this.categories = null;
        this.option = null;
        this.typeSelect = null;
        this.categorySelect = null;
        this.amountInput = null;
        this.dateInput = null;
        this.commentInputElement = null;
        this.commentInput = null;
        this.balance = document.getElementById('balance');
        this.page = localStorage.getItem('category');
        this.title = document.getElementById('title');
        this.fields = [
            {
                name: 'type',
                id: 'category-type',
                element: null,
                valid: false,
            },
            {
                name: 'category',
                id: 'category-name',
                element: null,
                valid: false,
            },
            {
                name: 'amount',
                id: 'category-amount',
                element: null,
                valid: false,
            },
            {
                name: 'date',
                id: 'category-date',
                element: null,
                valid: false,
            },
            {
                name: 'comment',
                id: 'category-comment',
                element: null,
                valid: false,
            }
        ];

        this.getBalance();

        new AirDatepicker('#category-date', {
            position: 'right center'
        });

        const that = this;

        this.fields.forEach(item => {
            item.element = document.getElementById(item.id);
        });

        this.typeSelect = this.fields.find(item => item.name === 'type').element;
        this.typeSelect.setAttribute('disabled', 'disabled');

        if (this.page === 'income') {
            this.typeSelect.value = 'доход';
            this.title.innerText = 'дохода';
        } else {
            this.typeSelect.value = 'расход';
            this.title.innerText = 'расхода';
        }

        this.categorySelect = this.fields.find(item => item.name === 'category').element;
        this.categorySelect.innerHTML = '<option selected>Категория...</option>';

        this.getCategoriesByType(this.page);

        this.commentInputElement = this.fields.find(item => item.name === 'comment').element;
        this.commentInputElement.setAttribute('maxlength', '35');

        this.buttonCreateElement = document.getElementById('button-create');
        this.buttonCreateElement.onclick = function () {
            that.init();
            that.getBalance();
        }

        this.buttonCancelElement = document.getElementById('button-cancel');
        this.buttonCancelElement.onclick = function () {
            location.href = '#/incomeandexpense';
        }
    }

    async init() {
        const userInfo = Auth.getUserInfo();
        if (!userInfo) {
            location.href = '#/';
        }

        this.amountInput = this.fields.find(item => item.name === 'amount').element.value;
        this.dateInput = this.fields.find(item => item.name === 'date').element.value.split('.').reverse().join('-');
        this.commentInput = this.commentInputElement.value;

        const categoryId = this.categories.find(category => {
            return this.categorySelect.value === category.title;
        }).id;


        try {
            const result = await CustomHttp.request(config.host + '/operations', 'POST', {
                type: this.page,
                amount: +this.amountInput,
                date: this.dateInput,
                comment: this.commentInput,
                category_id: +categoryId
            });

            if (result) {
                if (result.error) {
                    throw new Error(result.message);
                }
                location.href = '#/incomeandexpense';
            }
        } catch (error) {
            return console.log(error);
        }
    }

    async getCategoriesByType(value) {
        try {
            const result = await CustomHttp.request(config.host + '/categories/' + value);

            if (result) {
                if (result.error) {
                    throw new Error(result.error);
                }
                this.categories = result;
            }
        } catch (error) {
            return console.log(error);
        }
        this.processCategory();
    }

    processCategory() {
        this.categorySelect.innerHTML = '<option selected>Категория...</option>';
        this.categories.forEach(category => {
            this.option = document.createElement('option');
            this.option.value = category.title;
            this.option.textContent = category.title;
            this.categorySelect.appendChild(this.option);
        });
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