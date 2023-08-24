import {CustomHttp} from "../services/custom-http.js";
import config from "../../config/config.js";
import {Auth} from "../services/auth.js";

export class Category {
    constructor(page) {
        this.page = page;
        this.cards = [];
        this.balance = document.getElementById('balance');
        this.init();
    }

    async init() {
        const userInfo = Auth.getUserInfo();
        if (userInfo) {
            try {
                const result = await CustomHttp.request(config.host + '/categories/' + this.page);
                await this.getBalance();
                if (result) {
                    if (result.error) {
                        throw new Error(result.error);
                    }
                    this.cards = result;
                }
            } catch (error) {
                return console.log(error);
            }
            this.processIncome(this.page);
        }
    }

    processIncome(category) {
        const cardsElement = document.getElementById('cards');

        if (this.cards) {
            this.cards.forEach(card => {
                const that = this;
                const cardElement = document.createElement('div');
                cardElement.className = 'card';
                cardElement.setAttribute('data-id', card.id);

                const cardBodyElement = document.createElement('div');
                cardBodyElement.className = 'card-body p-0';

                const cardTitleElement = document.createElement('h3');
                cardTitleElement.className = 'card-title';
                cardTitleElement.innerText = card.title;

                const buttonEditElement = document.createElement('a');
                buttonEditElement.setAttribute('href', 'javascript:void(0)');
                buttonEditElement.className = 'btn btn-primary me-2';
                buttonEditElement.innerText = 'Редактировать';
                buttonEditElement.onclick = function () {

                    const dataId = this.parentElement.parentElement.getAttribute('data-id');
                    const cardTitle = buttonEditElement.previousElementSibling.textContent;

                    that.editNewCategory(dataId, cardTitle, this);
                }

                const buttonDeleteElement = document.createElement('a');
                buttonDeleteElement.setAttribute('href', 'javascript:void(0)');
                buttonDeleteElement.className = 'btn btn-danger';
                buttonDeleteElement.setAttribute('role', 'button');
                buttonDeleteElement.setAttribute('data-bs-toggle', 'modal');
                buttonDeleteElement.setAttribute('data-bs-target', '#staticBackdrop');
                buttonDeleteElement.innerText = 'Удалить';
                buttonDeleteElement.onclick = function () {
                    const dataId = buttonEditElement.parentElement.parentElement.getAttribute('data-id');
                    const cardTitle = buttonDeleteElement.previousElementSibling.previousElementSibling.textContent;
                    const buttonDelete = document.getElementById('button-confirm');

                    buttonDelete.onclick = function () {
                        localStorage.setItem('categoryName', cardTitle);
                        that.removeNewCategory(category, dataId, this);
                        cardElement.remove();
                    }
                }

                cardsElement.appendChild(cardElement);
                cardElement.appendChild(cardBodyElement);
                cardBodyElement.appendChild(cardTitleElement);
                cardBodyElement.appendChild(buttonEditElement);
                cardBodyElement.appendChild(buttonDeleteElement);
            });

            const that = this;
            const cardElement = document.createElement('div');
            cardElement.className = 'card';
            cardElement.onclick = function () {
                that.createNewCategory(this);
            }

            const cardBodyElement = document.createElement('div');
            cardBodyElement.className = 'card-body p-0 d-flex justify-content-center align-items-center';

            const plusElement = document.createElement('span');
            plusElement.innerText = '+';

            cardsElement.appendChild(cardElement);
            cardElement.appendChild(cardBodyElement);
            cardBodyElement.appendChild(plusElement);
        }
        localStorage.setItem('category', this.page);
    }

    createNewCategory() {
        location.href = '#/createcategory';
    }

    editNewCategory(id, categoryName) {
        localStorage.setItem('categoryId', id);
        localStorage.setItem('categoryName', categoryName);
        location.href = '#/editcategory';
    }

    async removeNewCategory(category, id) {
        try {
            const result = await CustomHttp.request(config.host + '/categories/' + category + '/' + id, 'DELETE');

            if (result) {
                localStorage.removeItem('categoryName');
                await this.getBalance();
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