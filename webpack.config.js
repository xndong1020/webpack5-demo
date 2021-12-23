const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
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
    mode: 'development',
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