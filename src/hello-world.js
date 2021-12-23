import './assets/sass/helloWorldBtn.scss';

export class HelloWorldButton {

    bodyElem = undefined;

    constructor() {
        this.bodyElem = document.querySelector('body');
        this.render();
    } 

    getContent() {
        const contentElem = document.createElement('p');
        contentElem.innerHTML = 'lorem lorem lorem';
        contentElem.classList.add('hello-world-content-text');
        this.bodyElem.appendChild(contentElem);
    }

    render() {
        const btnElem = document.createElement('button');
        btnElem.innerHTML = 'Hello World';
        btnElem.classList.add('hello-world-btn-text');
        btnElem.onclick = () => this.getContent();
        this.bodyElem.appendChild(btnElem);
    }
}