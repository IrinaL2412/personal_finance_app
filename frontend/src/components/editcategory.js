import {CustomHttp} from "../services/custom-http.js";
import config from "../../config/config.js";
import {Auth} from "../services/auth.js";

export class EditCategory {
    constructor() {
        this.categories = null;
        this.categoryNameElement = null;
        this.init();
    }

    init() {
        const userInfo = Auth.getUserInfo();
        if (!userInfo) {
            location.href = '#/';
        }

        const buttonSaveElement = document.getElementById('button-save');
        const buttonCancelElement = document.getElementById('button-cancel');
        this.categoryNameElement = document.getElementById('category-name');
        this.categoryNameElement.setAttribute('maxlength', '19');
        const titleElement = document.getElementById('title-word');
        const category = localStorage.getItem('category');
        let inputElement = document.getElementById('category-name');
        let inputValue = localStorage.getItem('categoryName');
        inputElement.value = inputValue;
        const that = this;

        this.getCategoriesByType(category);

        if (category === 'income') {
            titleElement.innerText = 'доходов';
            actionButtons();
        }

        if (category === 'expense') {
            titleElement.innerText = 'расходов';
            actionButtons();
        }

        function actionButtons() {
            buttonSaveElement.onclick = function () {
                that.editIncome(category, that.categoryNameElement.value, this);
            }

            buttonCancelElement.onclick = function () {
                localStorage.removeItem('categoryId');
                localStorage.removeItem('categoryName');
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

    async editIncome(category, name) {
        const id = localStorage.getItem('categoryId');

        if (this.categories.some(item => item.title === this.categoryNameElement.value))  {
            alert('Категория с данным названием уже существует');
        } else {
            try {
                const result = await CustomHttp.request(config.host + '/categories/' + category + '/' + id, 'PUT', {
                    title: name
                });

                if (result) {
                    if (result.error) {
                        throw new Error(result.error);
                    }
                    location.href = '#/' + category;
                    localStorage.removeItem('categoryId');
                    localStorage.removeItem('categoryName');

                }
            } catch (error) {
                return console.log(error);
            }
        }
    }
}