import { HelloWorldButton } from './hello-world'
import { loadImage } from './load-image';

import { generator } from './generator';

import fr from './assets/images/fr.svg';

import { upperCase } from 'lodash';

loadImage(fr);
new HelloWorldButton();

const gen = generator(10);

console.log(gen.next().value);
console.log(gen.next().value);

console.log('aaa', upperCase(process.env.NODE_ENV));