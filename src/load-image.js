import altText from './assets/text/altText.txt'

export const loadImage = (filepath) => {
    const imgElem = document.createElement('img');
    imgElem.alt = altText;
    imgElem.width = 300;
    imgElem.src = filepath;

    const bodyElem = document.querySelector('body');
    bodyElem.appendChild(imgElem);
};