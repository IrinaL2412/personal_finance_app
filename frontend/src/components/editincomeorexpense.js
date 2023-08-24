import {CustomHttp} from "../services/custom-http.js";
import config from "../../config/config.js";
import {Auth} from "../services/auth.js";

export class EditCategories {
    constructor() {

        this.buttonSaveElement = document.getElementById('button-save');
        this.buttonCancelElement = document.getElementById('button-cancel');

        this.typeInputElement = document.getElementById('category-type');
        this.typeInputElement.setAttribute('disabled', 'disabled');
        this.typeInputElement.value = localStorage.getItem('operationType');


        this.categoryInputElement = document.getElementById('category-name');
        this.categoryInputElement.setAttribute('disabled', 'disabled');
        this.categoryInputElement.value = localStorage.getItem('operationCategory');

        this.amountInputElement = document.getElementById('category-amount');
        this.amountInputElement.value = localStorage.getItem('operationAmount');

        this.dateInputElement = document.getElementById('category-date');
        this.dateInputElement.value = localStorage.getItem('operationDate');

        this.commentInputElement = document.getElementById('category-comment');
        this.commentInputElement.setAttribute('maxlength', '35');
        this.commentInputElement.value = localStorage.getItem('operationComment');

        this.balance = document.getElementById('balance');
        this.getBalance();

        new AirDatepicker('#category-date', {
            position: 'right center'
        });

        const that = this;

        this.buttonSaveElement.onclick = function () {
            that.editOperation(this);;
        }

        this.buttonCancelElement.onclick = function () {
            location.href = '#/incomeandexpense';
        }
    }

    async editOperation() {
        const userInfo = Auth.getUserInfo();
        if (!userInfo) {
            location.href = '#/';
        }

        let id = localStorage.getItem('operationId');
        let type = this.typeInputElement.value;
        let amount = this.amountInputElement.value.split('$')[0];
        let date = this.dateInputElement.value.split('.').reverse().join('-');
        let comment = this.commentInputElement.value;

        if (type === 'доход') {
            type = 'income'
        } else if (type === 'расход') {
            type = 'expense'
        }

        const categories = await CustomHttp.request(config.host + '/categories/' + type);
        const categoryId = categories.find(item => {
            if (item.title === this.categoryInputElement.value) {
                return item.id;
            }
        })

        try {
            const result = await CustomHttp.request(config.host + '/operations/' + id, 'PUT', {
                type: type,
                amount: +amount,
                date: date,
                comment: comment,
                category_id: +categoryId.id
            });

            if (result) {
                if (result.error) {
                    throw new Error(result.error);
                }
                location.href = '#/incomeandexpense';
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