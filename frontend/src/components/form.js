import {CustomHttp} from "../services/custom-http.js";
import {Auth} from "../services/auth.js";
import config from "../../config/config.js";

export class Form {
    constructor(page) {
        this.rememberMeElement = false;
        this.buttonElement = null;
        this.page = page;

        const accessToken = localStorage.getItem(Auth.accessTokenKey);
        if (accessToken) {
            location.href = '#/main';
            return;
        }

        this.fields = [
            {
                name: 'email',
                id: 'email',
                element: null,
                regex: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                valid: false,
            },
            {
                name: 'password',
                id: 'password',
                element: null,
                regex: /^(?=.*[A-Z])(?=.*\d).{8,}$/,
                valid: false,
            }
        ];

        if (this.page === 'signup') {
            this.fields.unshift({
                name: 'name',
                id: 'name',
                element: null,
                regex: /^[А-ЯЁ][а-яё]{2,}([-][А-ЯЁ][а-яё]{2,})?\s[А-ЯЁ][а-яё]{2,}\s[А-ЯЁ][а-яё]{2,}$/,
                valid: false,
            });

            this.fields.push({
                name: 'repeat-password',
                id: 'repeat-password',
                element: null,
                valid: false,
            });
        }

        const that = this;
        this.fields.forEach(item => {
            item.element = document.getElementById(item.id);
            item.element.onchange = function () {
                that.validateField.call(that, item, this);
            }
        });

        this.buttonElement = document.getElementById('button');
        this.buttonElement.classList.add('disabled');
        this.buttonElement.onclick = function () {
            that.processForm();
        }

        if (this.page === 'login') {
            this.rememberMeElement = document.getElementById('remember-me');
            that.validateForm();
        }
    }

    validateField(field, element) {
        const password = this.fields.find(item => item.name === 'password').element.value;

        if (element.value && element.value.match(field.regex)) {
            if (field.name === 'repeat-password' && element.value !== password) {
                element.style.borderColor = 'red';

                if (this.page === 'signup') {
                    element.parentElement.nextElementSibling.classList.remove('d-none');
                }

                field.valid = false;
                return;
            } else {
                element.removeAttribute('style');

                if (this.page === 'signup') {
                    element.parentElement.nextElementSibling.classList.add('d-none');
                }

                field.valid = true;
            }
        } else {
            element.style.borderColor = 'red';
            if (this.page === 'signup') {
                element.parentElement.nextElementSibling.classList.remove('d-none');
            }

            field.valid = false;
        }

        this.validateForm();
    }

    validateForm() {
        const isValid = this.fields.every(item => item.valid);

        if (isValid) {
            this.buttonElement.classList.remove('disabled');
        } else {
            this.buttonElement.classList.add('disabled');
        }
        return isValid;
    }

    async processForm() {
        if (this.validateForm()) {
            const email = this.fields.find(item => item.name === 'email').element.value;
            const password = this.fields.find(item => item.name === 'password').element.value;
            const rememberMe = this.rememberMeElement.checked;

            if (this.page === 'signup') {
                try {
                    const result = await CustomHttp.request(config.host + '/signup', 'POST', {
                        name: this.fields.find(item => item.name === 'name').element.value.split(' ')[1],
                        lastName: this.fields.find(item => item.name === 'name').element.value.split(' ')[0],
                        email: email,
                        password: password,
                        passwordRepeat: this.fields.find(item => item.name === 'repeat-password').element.value
                    });

                    if (result) {
                        if (result.error || !result.user) {
                            throw new Error(result.message);
                        }
                    }
                } catch (error) {
                    return console.log(error);
                }
            }
            try {
                const result = await CustomHttp.request(config.host + '/login', 'POST', {
                    email: email,
                    password: password,
                    rememberMe: rememberMe
                })

                if (result) {
                    if (result.error || !result.tokens.accessToken || !result.tokens.refreshToken || !result.user.name || !result.user.lastName) {
                        throw new Error(result.message);
                    }
                    Auth.setTokens(result.tokens.accessToken, result.tokens.refreshToken);
                    Auth.setUserInfo({
                        name: result.user.name,
                        lastName: result.user.lastName
                    })
                    location.href = '#/main';
                }
            } catch (error) {
                console.log(error);
            }
        }
    }
}