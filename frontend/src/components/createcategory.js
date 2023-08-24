import {CustomHttp} from "../services/custom-http.js";
import config from "../../config/config.js";
import {Auth} from "../services/auth.js";


export class CreateCategory {
    constructor() {
        this.categories = null;
        this.categoryNameElement = null;
        this.balance = document.getElementById('balance');
        this.init();
    }

    init() {
        const userInfo = Auth.getUserInfo();
        if (!userInfo) {
            location.href = '#/';
        }

        const buttonCreateElement = document.getElementById('button-create');
        const buttonCancelElement = document.getElementById('button-cancel');
        this.categoryNameElement = document.getElementById('category-name');
        this.categoryNameElement.setAttribute('maxlength', '19');

        const titleElement = document.getElementById('title-word');
        const that = this;
        const category = localStorage.getItem('category');

        this.getCategoriesByType(category);
        this.getBalance();

        if (category === 'income') {
            titleElement.innerText = 'доходов';
            actionButtons();
        }

        if (category === 'expense') {
            titleElement.innerText = 'расходов';
            actionButtons();
        }

        function actionButtons() {
            buttonCreateElement.onclick = function () {
                that.createIncome(category, that.categoryNameElement.value, this);
            }

            buttonCancelElement.onclick = function () {
                location.href = '#/' + category;
            }
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
    }

    async createIncome(category, name) {

          if (this.categories.some(item => item.title === this.categoryNameElement.value))  {
              console.log('yes');
              alert('Категория с данным названием уже существует');
          }

        try {
            const result = await CustomHttp.request(config.host + '/categories/' + category, 'POST', {
                title: name
            });

            if (result) {
                if (result.error) {
                    throw new Error(result.error);
                }
                location.href = '#/' + category;
            }
        } catch (error) {
            return console.log(error);
        }
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