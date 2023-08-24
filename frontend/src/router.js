import {Main} from "./components/main.js";
import {Form} from "./components/form.js";
import {Auth} from "./services/auth.js";
import {Category} from "./components/category.js";
import {Incomeandexpense} from "./components/incomeandexpense.js";
import {CreateCategory} from "./components/createcategory.js";
import {EditCategory} from "./components/editcategory.js";
import {CreateCategories} from "./components/createincomeorexpense.js";
import {EditCategories} from "./components/editincomeorexpense.js";

export class Router {
    constructor() {
        this.contentElement = document.getElementById('content');
        this.stylesElement = document.getElementById('styles');
        this.titleElement = document.getElementById('page-title');
        this.profileFullNameElement = document.getElementById('profile-full-name');
        this.menuLinks = document.querySelectorAll('#sidebar a');

        this.routes = [
            {
                route: '#/main',
                title: 'Главная',
                template: 'templates/main.html',
                styles: 'styles/index.css',
                load: () => {
                    new Main();
                }
            },
            {
                route: '#/signup',
                title: 'Регистрация',
                template: 'templates/signup.html',
                styles: 'styles/form.css',
                load: () => {
                    new Form('signup');
                }
            },
            {
                route: '#/',
                title: 'Вход в систему',
                template: 'templates/login.html',
                styles: 'styles/form.css',
                load: () => {
                    new Form('login');
                }
            },
            {
                route: '#/incomeandexpense',
                title: 'Доходы и расходы',
                template: 'templates/incomeandexpense.html',
                styles: 'styles/incomeandexpense.css',
                load: () => {
                    new Incomeandexpense();
                }
            },
            {
                route: '#/income',
                title: 'Доходы',
                template: 'templates/income.html',
                styles: 'styles/index.css',
                load: () => {
                    new Category('income');
                }
            },
            {
                route: '#/expense',
                title: 'Расходы',
                template: 'templates/expense.html',
                styles: 'styles/index.css',
                load: () => {
                    new Category('expense');
                }
            },
            {
                route: '#/createcategory',
                title: 'Создание категории',
                template: 'templates/createcategory.html',
                styles: 'styles/index.css',
                load: () => {
                    new CreateCategory();
                }
            },
            {
                route: '#/editcategory',
                title: 'Редактирование категории',
                template: 'templates/editcategory.html',
                styles: 'styles/index.css',
                load: () => {
                    new EditCategory();
                }
            },
            {
                route: '#/createincomeorexpense',
                title: 'Создание дохода/расхода',
                template: 'templates/createincomeorexpense.html',
                styles: 'styles/index.css',
                load: () => {
                    new CreateCategories();
                }
            },
            {
                route: '#/editincomeorexpense',
                title: 'Редактирование дохода/расхода',
                template: 'templates/editincomeorexpense.html',
                styles: 'styles/index.css',
                load: () => {
                    new EditCategories();
                }
            },
        ]
    }

    async openRoute() {
        const urlRoute = window.location.hash;
        if (urlRoute === '#/logout') {
            await Auth.logout();
            window.location.href = '#/';
            localStorage.removeItem('category');
            return;
        }

        if (urlRoute !== '#/editincomeorexpense') {
            localStorage.removeItem('operationAmount');
            localStorage.removeItem('operationCategory');
            localStorage.removeItem('operationComment');
            localStorage.removeItem('operationDate');
            localStorage.removeItem('operationId');
            localStorage.removeItem('operationType');
        }

        const newRoute = this.routes.find(item => {
            return item.route === urlRoute;
        });

        if (!newRoute) {
            window.location.href = '#/';
            return;
        }

        this.contentElement.innerHTML =
            await fetch(newRoute.template).then(response => response.text());
        this.stylesElement.setAttribute('href', newRoute.styles);
        this.titleElement.innerText = newRoute.title;

        const userInfo = Auth.getUserInfo();
        const accessToken = localStorage.getItem(Auth.accessTokenKey);
        const incomeAndExpenseLink = document.getElementById('income-and-expense');

        if (userInfo && accessToken) {
            this.profileFullNameElement.innerText = userInfo.name + userInfo.lastName;
        }

        newRoute.load();

        this.menuLinks.forEach(link => {
            if (link.href === location.href) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }

            if (location.hash === '#/createincomeorexpense' || location.hash === '#/editincomeorexpense') {
                incomeAndExpenseLink.classList.add('active');
            }

        });
    }
}