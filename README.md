### Init & Installation

#### Installation

```
yarn add -D webpack webpack-cli
```

Init project

index.html
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <script src="./src/index.js"></script>
</body>
</html>
```

src/index.js (note: using ES6 modules)

```js
import { helloWorld } from './hello-world'

helloWorld();
```

src/hello-world.js  (note: using ES6 modules)

```js
export const helloWorld = () => {
    console.log('Hello World!')
}
```

now we can run `npx webpack` to build a bundled js file. Webpack 4 & 5 comes with a default configuration. 

By default, it founds the default entry file from 'src/index.js', and output to 'dist/main.js'

The generated `dist/main.js` file

```js
(()=>{"use strict";console.log("Hello World!")})();
```

You can use `webpack --stats detailed` to see more details

#### Custom Webpack Configuration

The default name of the webpack config file is `webpack.config.js` at the project root level.

Below is the bare minimum options for the config file

./webpack.config.js
```js
const path = require('path');

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, './dist') // MUST be an absolute path!
    },
    mode: 'none'
}
```

Note:
1. Webpack 4 & 5 config files are using common.js modules, it doesn't recognize ES6 modules.
2. the output path has to be an absolute path. so we use path.resolve(__dirname, './dist') to get the absolute path of the '.dist' folder



### Assets Modules (new feature to Webpack5)

#### 4 Types of Assets Modules
- asset/resource emits files into the output directory, and exports the url to that file. mainly used for large image files/font files.
- asset/inline inline the file into the bundle as data uri. mainly used for small assets files, for example svg files.
- asset combines the previous two types. Webpack will automatically choose between `asset/resource` or `asset/inline`. If the file size is less than 8kb, then `asset/inline`.
- asset/source. Sometime you have plain text file saved in text file, you can use this type to import such kind of data. It import the source data from the source file as is, and inject it into the javascript bundle file, as a string of text.

#### asset/resource

Now we add a js file to display an img element on screen

src/load-image.js
```js
export const loadImage = (filepath) => {
    const imgElem = document.createElement('img');
    imgElem.alt = 'kiwi';
    imgElem.width = 300;
    imgElem.src = filepath;

    const bodyElem = document.querySelector('body');
    bodyElem.appendChild(imgElem);
};
```

and in the `src/index.js` file

src/load-image.js
```js
import { helloWorld } from './hello-world'
import { loadImage } from './load-image';

import kiwi from './assets/images/kiwi.jpg';

helloWorld();
loadImage(kiwi);

```

If you run the build script, you will get an error, because by default webpack doesn't know how to import image files. 

```
ERROR in ./src/assets/images/kiwi.jpg 1:0
Module parse failed: Unexpected character '�' (1:0)
You may need an appropriate loader to handle this file type, currently no loaders are configured to process this file. See https://webpack.js.org/concepts#loaders
(Source code omitted for this binary file)
```

You need to create a set of rules for Webpack to load different file types.

./webpack.config.js
```js
const path = require('path');

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, './dist') // MUST be an absolute path!
    },
    mode: 'none',
    module: {
        rules: [
            {
                test: /\.(png|jpg)$/,
                type: 'asset/resource'
            }
        ]
    }
}
```

Each rule contains at least 2 properties. 'test' for matching the file type, and 'type' for choosing 1 of the 4 Types of Assets Modules.
In above example we used the 'asset/resource' type. This will generated an image file in the output directory. By default, asset/resource modules are emitting with [hash][ext][query] filename into output directory, and inject the url of the generated image file into the bundled js file.

```js
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "loadImage": () => (/* binding */ loadImage)
/* harmony export */ });
const loadImage = (filepath) => {
    const imgElem = document.createElement('img');
    imgElem.alt = 'kiwi';
    imgElem.width = 300;
    imgElem.src = filepath;

    const bodyElem = document.querySelector('body');
    bodyElem.appendChild(imgElem);
};

/***/ }),
/* 3 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__.p + "cd65ee236cf26005267b.jpg";
```


#### public path

Public Path allows you to specify the **base path for all the assets** within your application.


By default, webpack 5 use `publicPath: 'auto'`.  and the generated assets file path will be something like `<img alt="kiwi" width="300" src="http://127.0.0.1:5500/dist/cd65ee236cf26005267b.jpg">`, it is an absolute path. 

You can change the config to something like `publicPath: 'dist/'`, and the generated path will be a relative path to that file `<img alt="kiwi" width="300" src="dist/cd65ee236cf26005267b.jpg">`

```js
const path = require('path');

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, './dist'), // MUST be an absolute path!
        publicPath: 'dist/' // can use relative path here.
    },
    mode: 'none',
    module: {
        rules: [
            {
                test: /\.(png|jpg)$/,
                type: 'asset/resource'
            }
        ]
    }
}
```

we can specify the sub-directory for static files

./webpack.config.js
```js
const path = require('path');

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, './dist'), // MUST be an absolute path!
        publicPath: 'dist/', // can use relative path here.
        assetModuleFilename: 'static/[hash][ext][query]'
    },
    mode: 'none',
    module: {
        rules: [
            {
                test: /\.(png|jpg)$/,
                type: 'asset/resource'
            },
            {
                test: /\.svg$/,
                type: 'asset/resource'
            }
        ]
    }
}
```

and the generated url for the assets files will become `<img alt="kiwi" width="300" src="dist/static/fc7c74a444b9565dca15.svg">`

It looks simple, but will be very important when we are using module federation, or cdn/express urls.


For example we have a cdn svg file `https://cdn.ipregistry.co/flags/emojitwo/fr.svg`.

for local development, we can use the file from our local env

src/index.js
```
import { helloWorld } from './hello-world'
import { loadImage } from './load-image';

import fr from './assets/images/fr.svg';

helloWorld();
loadImage(fr);
```

and add a Webpack rule for loading svg file

```js
const path = require('path');

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, './dist'), // MUST be an absolute path!
        publicPath: 'dist/' // can use relative path here.
    },
    mode: 'none',
    module: {
        rules: [
            {
                test: /\.(png|jpg)$/,
                type: 'asset/resource'
            },
            {
                test: /\.svg$/,
                type: 'asset/resource'
            }
        ]
    }
}
```

Webpack will generate an svg file to the output directory. `<img alt="kiwi" width="300" src="dist/fc7c74a444b9565dca15.svg">`

However we can use the initial file name, instead of the md5 hash value

./webpack.config.js
```js
const path = require('path');

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, './dist'), // MUST be an absolute path!
        publicPath: 'dist/', // can use relative path here.
        assetModuleFilename: 'static/[hash][ext][query]'
    },
    mode: 'none',
    module: {
        rules: [
            {
                test: /\.(png|jpg)$/,
                type: 'asset/resource'
            },
            {
                test: /\.svg$/,
                type: 'asset/resource',
                generator: {
                    filename: 'static/[name][ext][query]'
                }
            }
        ]
    }
}
```

The generated file will use it original name. `<img alt="kiwi" width="300" src="dist/static/fr.svg">`

now we can use the cdn url instead of local files

```js
const path = require('path');

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, './dist'), // MUST be an absolute path!
        publicPath: 'https://cdn.ipregistry.co/', // can use relative path here.
        assetModuleFilename: 'static/[hash][ext][query]'
    },
    mode: 'none',
    module: {
        rules: [
            {
                test: /\.(png|jpg)$/,
                type: 'asset/resource'
            },
            {
                test: /\.svg$/,
                type: 'asset/resource',
                generator: {
                    filename: 'flags/emojitwo/[name][ext][query]'
                }
            }
        ]
    }
}
```

Now the bundle will load assets files from `https://cdn.ipregistry.co/`, instead of current domain. `<img alt="kiwi" width="300" src="https://cdn.ipregistry.co/flags/emojitwo/fr.svg">`




####  Asset/inline Module Type
It will generate a base64 data uri of the file, and inject it into the javascript bundle file.


```js
const path = require('path');

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, './dist'), // MUST be an absolute path!
        publicPath: 'dist/', // can use relative path here.
        assetModuleFilename: 'static/[hash][ext][query]'
    },
    mode: 'none',
    module: {
        rules: [
            {
                test: /\.(png|jpg)$/,
                type: 'asset/resource',
                generator: {
                    filename: 'static/[name][ext][query]'
                }
            },
            {
                test: /\.svg$/,
                type: 'asset/inline'
            }
        ]
    }
}
```

Generated Data uri will be `<img alt="kiwi" width="300" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+CiAgICA8cGF0aCBmaWxsPSIjNDI4YmMxIiBkPSJNMS45IDMyYzAgMTMuMSA4LjQgMjQuMiAyMCAyOC4zVjMuN0MxMC4zIDcuOCAxLjkgMTguOSAxLjkgMzJ6Ii8+CiAgICA8cGF0aCBmaWxsPSIjZWQ0YzVjIiBkPSJNNjEuOSAzMmMwLTEzLjEtOC4zLTI0LjItMjAtMjguM3Y1Ni42YzExLjctNC4xIDIwLTE1LjIgMjAtMjguMyIvPgogICAgPHBhdGggZmlsbD0iI2ZmZiIgZD0iTTIxLjkgNjAuM2MzLjEgMS4xIDYuNSAxLjcgMTAgMS43czYuOS0uNiAxMC0xLjdWMy43QzM4LjggMi42IDM1LjUgMiAzMS45IDJzLTYuOS42LTEwIDEuN3Y1Ni42Ii8+Cjwvc3ZnPgo=">`

Note:
Do NOT use it for large image/font files, it will make your bundled javascript file much bigger!


#### General Asset Type
Automatically choose between `asset/inline` and `asset/resource`, by following a default condition: a file with size less than 8kb will be treated as a inline module type and resource module type otherwise.

you can change this max size 

```js
const path = require('path');

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, './dist'), // MUST be an absolute path!
        publicPath: 'dist/', // can use relative path here.
        assetModuleFilename: 'static/[hash][ext][query]'
    },
    mode: 'none',
    module: {
        rules: [
            {
                test: /\.(png|jpg)$/,
                type: 'asset/resource',
                generator: {
                    filename: 'static/[name][ext][query]'
                }
            },
            {
                test: /\.svg$/,
                type: 'asset',
                parser: {
                    dataUrlCondition: {
                        maxSize: 4 * 1024 // 4kb
                      }
                }
            }
        ]
    }
}
```

#### Asset/source Module Type

src/load-images.js
```js
import altText from './assets/text/altText'

export const loadImage = (filepath) => {
    const imgElem = document.createElement('img');
    imgElem.alt = altText;
    imgElem.width = 300;
    imgElem.src = filepath;

    const bodyElem = document.querySelector('body');
    bodyElem.appendChild(imgElem);
};
```

And load text from an external text file

./assets/text/altText.txt
```text
France Flag alt text
```

When you run build, you will get below error

```
ERROR in ./src/load-image.js 1:0-43
Module not found: Error: Can't resolve './assets/text/altText' in '/home/isdance/Desktop/js_projects/webpack5_guide/src'
resolve './assets/text/altText'
```

we need a rule for text file

```js
const path = require('path');

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, './dist'), // MUST be an absolute path!
        publicPath: 'dist/', // can use relative path here.
        assetModuleFilename: 'static/[hash][ext][query]'
    },
    mode: 'none',
    module: {
        rules: [
            {
                test: /\.(png|jpe?g)$/,
                type: 'asset/resource',
                generator: {
                    filename: 'static/[name][ext][query]'
                }
            },
            {
                test: /\.te?xt$/,
                type: 'asset/source'
            },
            {
                test: /\.svg$/,
                type: 'asset',
                parser: {
                    dataUrlCondition: {
                        maxSize: 4 * 1024 // 4kb
                      }
                },
                generator: {
                    filename: 'static/[name][ext][query]'
                }
            }
        ]
    }
}
```

### Loaders

Webpack enables use of loaders to preprocess files. such as sass/css/handlebar/latest js features. This allows you to bundle any static resource way beyond JavaScript.

#### css loader

src/hello-world.js
```js
import './assets/css/HelloWorldButton.css';

export class HelloWorldButton {

    bodyElem;

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
```

/assets/css/HelloWorldButton.css 

```css
.hello-world-content-text {
    color: green;
}

.hello-world-btn-text {
    color: red;
}
```

When you run build now, you will get below error

```
ERROR in ./src/hello-world.js 1:0-43
Module not found: Error: Can't resolve './assets/css/helloWorldBtn.css' in '/home/isdance/Desktop/js_projects/webpack5_guide/src'
```

We need a loader for css file

```
yarn add -D css-loader style-loader
```

then add a new rule for css file

```js
const path = require('path');

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, './dist'), // MUST be an absolute path!
        publicPath: 'dist/', // can use relative path here.
        assetModuleFilename: 'static/[hash][ext][query]'
    },
    mode: 'none',
    module: {
        rules: [
            {
                test: /\.(png|jpe?g)$/,
                type: 'asset/resource',
                generator: {
                    filename: 'static/[name][ext][query]'
                }
            },
            {
                test: /\.te?xt$/,
                type: 'asset/source'
            },
            {
                test: /\.svg$/,
                type: 'asset',
                parser: {
                    dataUrlCondition: {
                        maxSize: 4 * 1024 // 4kb
                      }
                },
                generator: {
                    filename: 'static/[name][ext][query]'
                }
            },
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            }
        ]
    }
}
```

From the bundle.js you can find the css styles

```js
var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, ".hello-world-content-text {\n    color: green;\n}\n\n.hello-world-btn-text {\n    color: red;\n}", ""]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);
```

#### SASS loader

```js
yarn add -D sass-loader sass
```

webpack.config.js

```js
const path = require('path');

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, './dist'), // MUST be an absolute path!
        publicPath: 'dist/', // can use relative path here.
        assetModuleFilename: 'static/[hash][ext][query]'
    },
    mode: 'none',
    module: {
        rules: [
            {
                test: /\.(png|jpe?g)$/,
                type: 'asset/resource',
                generator: {
                    filename: 'static/[name][ext][query]'
                }
            },
            {
                test: /\.te?xt$/,
                type: 'asset/source'
            },
            {
                test: /\.svg$/,
                type: 'asset',
                parser: {
                    dataUrlCondition: {
                        maxSize: 4 * 1024 // 4kb
                      }
                },
                generator: {
                    filename: 'static/[name][ext][query]'
                }
            },
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.s(a|c)ss$/,
                use: ["style-loader", "css-loader", "sass-loader"],
            }
        ]
    }
}
```

src/load-image.js

```js
import './assets/sass/helloWorldBtn.scss';

export class HelloWorldButton {

    bodyElem;

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
```

./assets/sass/helloWorldBtn.scss

```scss
.hello-world-content-text {
   color: yellow;
}

.hello-world-btn-text {
   color: pink;
}
```


### Plugins
Plugins are additional JavaScript libraries that do everything that loaders cannot do.

Plugins can also modify how the bundles themselves are created. For example, uglifyJSPlguin takes the bundle.js and minimizes the contents to decrease the bundle size.

#### minify of the resulting webpack bundle

```
yarn add -D terser-webpack-plugin 
```

webpack.config.js
```js
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, './dist'), // MUST be an absolute path!
        publicPath: 'dist/', // can use relative path here.
        assetModuleFilename: 'static/[hash][ext][query]'
    },
    mode: 'none',
    module: {
        rules: [
            {
                test: /\.(png|jpe?g)$/,
                type: 'asset/resource',
                generator: {
                    filename: 'static/[name][ext][query]'
                }
            },
            {
                test: /\.te?xt$/,
                type: 'asset/source'
            },
            {
                test: /\.svg$/,
                type: 'asset',
                parser: {
                    dataUrlCondition: {
                        maxSize: 4 * 1024 // 4kb
                      }
                },
                generator: {
                    filename: 'static/[name][ext][query]'
                }
            },
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.s(a|c)ss$/,
                use: ["style-loader", "css-loader", "sass-loader"],
            }
        ]
    },
    plugins: [
        new TerserPlugin()
    ]
}
```

it reduces the size of the bundle.js from 21kb to 5kb


### extract css into a separate bundle with mini-css-extract-plugin

```
yarn add -D mini-css-extract-plugin
```

webpack.config.js
```js
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, './dist'), // MUST be an absolute path!
        publicPath: 'dist/', // can use relative path here.
        assetModuleFilename: 'static/[hash][ext][query]'
    },
    mode: 'none',
    module: {
        rules: [
            {
                test: /\.(png|jpe?g)$/,
                type: 'asset/resource',
                generator: {
                    filename: 'static/[name][ext][query]'
                }
            },
            {
                test: /\.te?xt$/,
                type: 'asset/source'
            },
            {
                test: /\.svg$/,
                type: 'asset',
                parser: {
                    dataUrlCondition: {
                        maxSize: 4 * 1024 // 4kb
                      }
                },
                generator: {
                    filename: 'static/[name][ext][query]'
                }
            },
            {
                test: /\.css$/i,
                use: [MiniCssExtractPlugin.loader, "css-loader"],
            },
            {
                test: /\.s(a|c)ss$/,
                use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
            }
        ]
    },
    plugins: [
        new TerserPlugin(),
        new MiniCssExtractPlugin({
            filename: '[name].css' // default name is 'main.css'
        })
    ]
}
```

steps:
1. add the MiniCssExtractPlugin to 'plugins' section
```js
 plugins: [
        new TerserPlugin(),
        new MiniCssExtractPlugin({
            filename: '[name].css' // default name is 'main.css'
        })
    ]
```

2. replace the `style-loader` with `MiniCssExtractPlugin.loader`

```js
 module: {
        rules: [
            {
                test: /\.css$/i,
                use: [MiniCssExtractPlugin.loader, "css-loader"],
            },
            {
                test: /\.s(a|c)ss$/,
                use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
            }
        ]
    }
```

3. add the generated css file to html

```html
<link rel="stylesheet" href="./dist/main.css">
```


#### Browser caching
use [contenthash] to avoid staled content

webpack.config.js
```js
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'bundle.[contenthash].js',
        path: path.resolve(__dirname, './dist'), // MUST be an absolute path!
        publicPath: 'dist/', // can use relative path here.
        assetModuleFilename: 'static/[hash][ext][query]'
    },
    mode: 'none',
    module: {
        rules: [
            {
                test: /\.(png|jpe?g)$/,
                type: 'asset/resource',
                generator: {
                    filename: 'static/[name][ext][query]'
                }
            },
            {
                test: /\.te?xt$/,
                type: 'asset/source'
            },
            {
                test: /\.svg$/,
                type: 'asset',
                parser: {
                    dataUrlCondition: {
                        maxSize: 4 * 1024 // 4kb
                      }
                },
                generator: {
                    filename: 'static/[name][ext][query]'
                }
            },
            {
                test: /\.css$/i,
                use: [MiniCssExtractPlugin.loader, "css-loader"],
            },
            {
                test: /\.s(a|c)ss$/,
                use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(),
        new TerserPlugin(),
        new MiniCssExtractPlugin({
            filename: '[name].[contenthash].css' // default name is 'main.css'
        })
    ]
}
```

#### clean dist folder before generating new bundles 

```
yarn add -D clean-webpack-plugin
```


```js
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

...

plugins: [
        new CleanWebpackPlugin(),
        new TerserPlugin(),
        new MiniCssExtractPlugin({
            filename: '[name].[contenthash].css' // default name is 'main.css'
        })
    ]
```

Note:
You can clean multiple folders, for example you have another folder that you want to clear is called 'test'

```js
plugins: [
        new CleanWebpackPlugin({
            cleanOnceBeforeBuildPatterns: [
                '**/*', // everything inside output folder,
                path.join(process.cwd(), 'test/**/*') // everything inside 'test' folder
            ]
        })
    ]
}
```

#### auto generated links in html by generating html dynamically

```
yarn add -D html-webpack-plugin
```

webpack.config.js

```js
const HtmlWebpackPlugin = require('html-webpack-plugin');

...

output: {
        ...
        publicPath: 'auto', // can use relative path here.
        ...
    },

...

plugins: [
        new CleanWebpackPlugin({
            cleanOnceBeforeBuildPatterns: [
                '**/*', // everything inside output folder,
                path.join(process.cwd(), 'test/**/*') // everything inside 'test' folder
            ]
        }),
        new TerserPlugin(),
        new MiniCssExtractPlugin({
            filename: '[name].[contenthash].css' // default name is 'main.css'
        }),
        new HtmlWebpackPlugin()
    ]
```

it will use the index.html from our project as template, and generate a new index.html file inside of the output folder, with the links to the hashed js and css files

The original html

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
</body>
</html>
```

The generated html file


```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Webpack App</title>
  <meta name="viewport" content="width=device-width, initial-scale=1"><script defer src="bundle.6852cc0c88258bec63e4.js"></script><link href="main.db184de367c6e3e0936d.css" rel="stylesheet"></head>
  <body>
  </body>
</html>
```

#### Customize generated html files
There are some issues with the default index.html. for example, from previous example, webpack replaced the index.html title to `Webpack App`.

We want to have our title back


```js
new HtmlWebpackPlugin({
    title: 'Custom template',
    template: 'template.html', // from which source html file
    filename: 'index.html', // index.html is the default name
    meta: {
        description: "Some description"
    }
})
```

and the 'template.html' file 

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><%= htmlWebpackPlugin.options.title %></title>
</head>
<body>
</body>
</html>
```

The generated file is 

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Custom template</title>
<meta name="description" content="Some description"><script defer src="bundle.6852cc0c88258bec63e4.js"></script><link href="main.db184de367c6e3e0936d.css" rel="stylesheet"></head>
<body>
</body>
</html>
```

### Mode
- 'none' meaning we don't want any builtin optimizations.
- 'development' enables useful names for modules and chunks.
- 'production' enables deterministic mangled names for modules and chunks, FlagDependencyUsagePlugin, FlagIncludedChunksPlugin, ModuleConcatenationPlugin, NoEmitOnErrorsPlugin and TerserPlugin.

Also, set mode to above values, will automatically inject its value into `process.env.NODE_ENV`.


For development mode, it will disable the minify plugins, and you will see the error from the unminified js file. However for production mode, you will see the error from the minified js file, which only has 1 line.


### Webpack-merge

```
yarn add -D webpack-merge
```

webpack.common.js

```js
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'bundle.[contenthash].js',
        path: path.resolve(__dirname, './dist'), // MUST be an absolute path!
        publicPath: 'auto', // can use relative path here.
        assetModuleFilename: 'static/[hash][ext][query]'
    },
    module: {
        rules: [
            {
                test: /\.(png|jpe?g)$/,
                type: 'asset/resource',
                generator: {
                    filename: 'static/[name][ext][query]'
                }
            },
            {
                test: /\.te?xt$/,
                type: 'asset/source'
            },
            {
                test: /\.svg$/,
                type: 'asset',
                parser: {
                    dataUrlCondition: {
                        maxSize: 4 * 1024 // 4kb
                      }
                },
                generator: {
                    filename: 'static/[name][ext][query]'
                }
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin({
            cleanOnceBeforeBuildPatterns: [
                '**/*', // everything inside output folder,
                path.join(process.cwd(), 'test/**/*') // everything inside 'test' folder
            ]
        }),
        new HtmlWebpackPlugin({
            title: 'Custom template',
            template: 'template.html', // from which source html file
            filename: 'index.html', // index.html is the default name
            meta: {
                description: "Some description"
            }
        })
    ]
}
```

webpack.development.js

```js
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
 
module.exports = merge(common, {
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.s(a|c)ss$/,
                use: ["style-loader", "css-loader", "sass-loader"],
            }
        ]
    },
})
```

webpack.production.js

```js
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = merge(common, {
    mode: 'production',
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: [MiniCssExtractPlugin.loader, "css-loader"],
            },
            {
                test: /\.s(a|c)ss$/,
                use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
            }
        ]
    },
    plugins: [
        new TerserPlugin(),
        new MiniCssExtractPlugin({
            filename: '[name].[contenthash].css' // default name is 'main.css'
        })
    ]
})
```

And we need to create some npm scripts to use deferent config files

```js
 "scripts": {
    "dev": "webpack --config webpack.development.js",
    "build": "webpack --config webpack.production.js"
  },
```


### Webpack Dev Server

```
yarn add -D webpack-dev-server
```

webpack.development.js

```js
const path = require('path');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
 
module.exports = merge(common, {
    mode: 'development',
    devServer: {
        port: 9000,
        static: {
            directory: path.resolve(__dirname, './dist')
        },
        devMiddleware: {
            index: 'index.html', // the generated index page name
            writeToDisk: false // don't generate files to disk
        }
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.s(a|c)ss$/,
                use: ["style-loader", "css-loader", "sass-loader"],
            }
        ]
    },
})
```

And we need a npm script to open the dev server

```
"scripts": {
    "dev": "webpack serve --open --config webpack.development.js"
  },
```


```
$ webpack serve --open --config webpack.development.js
<i> [webpack-dev-server] Project is running at:
<i> [webpack-dev-server] Loopback: http://localhost:9000/
```


### Code splitting for optimization

src/index.js
```js
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
```

We added lodash to our project.

Without code splitting, the lodash module was bundled into bundle.js

output
```
asset bundle.3427f0c3013f2b733b0b.js 70.7 KiB [emitted] [immutable] [minimized] (name: main) 1 related asset
asset index.html 416 bytes [emitted]
asset main.3519cb58d794d662b0d4.css 71 bytes [emitted] [immutable] (name: main)
```

Now, if we added code splitting into the production build

webpack.production.js
```js
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = merge(common, {
    mode: 'production',
    optimization: {
        splitChunks: {
            chunks: 'all',
            minSize: 3000
        }
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: [MiniCssExtractPlugin.loader, "css-loader"],
            },
            {
                test: /\.s(a|c)ss$/,
                use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
            }
        ]
    },
    plugins: [
        new TerserPlugin(),
        new MiniCssExtractPlugin({
            filename: '[name].[contenthash].css' // default name is 'main.css'
        })
    ]
})
```

from the output

```
assets by path *.js 71.5 KiB
  asset bundle.e78cd4b81283d6dc7131.js 69 KiB [emitted] [immutable] [minimized] (id hint: vendors) 1 related asset
  asset bundle.4ec3626cbdb2bc058566.js 2.5 KiB [emitted] [immutable] [minimized] (name: main)
asset index.html 484 bytes [emitted]
asset main.3519cb58d794d662b0d4.css 71 bytes [emitted] [immutable] (name: main)
```

You can see, the lodash module was bundled into a separate js file, which makes our main JavaScript file size become much smaller.

