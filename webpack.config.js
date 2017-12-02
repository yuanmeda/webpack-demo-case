const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    entry:__dirname + "/app/main.js",//唯一入口文件
    output:{
        path:__dirname + "/dist", // 打包后存放文件的路径
        filename:"bundle.js" // 打包后输出文件的文件名
    },
    // 生成Source Maps（使调试更容易）
    devtool: "eval-source-map",// webpack就可以在打包时为我们生成的source maps，这为我们提供了一种对应编译文件和源文件的方法，使得编译后的代码可读性更高，也更容易调试
    // 使用webpack构建本地服务器
    /**
     * 除了此配置外：
     * 1.安装依赖 npm install --save-dev webpack-dev-server 或者在devDependencies添加依赖 "webpack-dev-server": "^2.9.5"
     * 2.在package.json中的scripts对象中添加如下命令，用以开启本地服务器
     * {
     *  "test": "echo \"Error: no test specified\" && exit 1",
        "start": "webpack",
        "server": "webpack-dev-server --open"
     * }
     * 其他可选配置项
     *  port:8080, //设置默认监听端口，如果省略，默认为8080
     *  在控制台输入 npm run server 则可以通过http://localhost:8080进行访问
     */
    devServer:{
        contentBase:"./public", // 本地服务器所加载的页面在所在的目录，默认webpack-dev-server会为根文件夹提供本地服务器，如果想为另外一个目录下的文件提供本地服务器，应该在这里设置其所在目录（本例设置到“public"目录）
        historyApiFallback:true, //不跳转 在开发单页应用时非常有用，它依赖于HTML5 history API，如果设置为true，所有的跳转将指向index.html
        inline:true,//设置为true ，当源文件改变时会自动刷新页面
        hot: true //热加载
    },
    /**
     * Loaders
     * 通过使用不同的loader，webpack有能力调用外部的脚本或工具，实现对不同格式的文件的处理比如说分析转换scss为css，或者把下一代的JS文件（ES6，ES7)转换为现代浏览器兼容的JS文件，对React的开发而言，合适的Loaders可以把React的中用到的JSX文件转换为JS文件
         test:: 一个用以匹配loaders所处理文件的拓展名的正则表达式（必须）
         loader:loader的名称（必须）
         include/exclude:  手动添加必须处理的文件（文件夹）或屏蔽不需要处理的文件（文件夹）（可选）；
     *   query:'' //为loaders提供额外的设置选项（可选）
     * 配置babel
     * // npm一次性安装多个依赖模块，模块之间用空格隔开
        npm install --save-dev babel-core babel-loader babel-preset-es2015 babel-preset-react
     */
    module:{
        rules:[
            {
                test: /\.(js|jsx)$/,
                use:{
                    loader:"babel-loader", //这里把对babel的配置放在单独的配置文件.babelrc中，webpack会自动调用
                    // options:{
                    //     presets:["es2015","react"] //允许使用这两种语法
                    // }
                },
                exclude:/node_modules/
            },{
                test:/\.css$/,
                use:[ //注意这里style-loader 必须写在css-loader前面，不然会报错
                    {
                        loader:"style-loader"
                    },
                    {
                        loader:"css-loader",
                        options:{
                            modules:true  // CSS module 可以直接把CSS的类名传递到组件的代码中，且这样做只对当前组件有效，不必担心在不同的模块中使用相同的类名造成冲突
                        }
                    },
                    //PostCSS来为CSS代码自动添加适应不同浏览器的CSS前缀。安装postcss-loader 和 autoprefixer（自动添加前缀的插件）
                    //新建postcss.config.js, 在postcss.config.js中添加相关插件信息
                    {
                        loader: "postcss-loader"
                    }
                ]
            }
        ]
    },
    /**
     *plugins插件
     * loaders是在打包构建过程中用来处理源文件的（JSX，Scss，Less..），一次处理一个，插件并不直接操作单个文件，它直接对整个构建过程其作用
     * 使用方法：
     * 要使用某个插件，我们需要通过npm安装它，在webpack配置中的plugins关键字部分添加该插件的一个实例（plugins是一个数组）
     *
     *
     *
     */
    plugins:[
        new webpack.BannerPlugin("版权所有，翻版必究！"),
        //依据一个简单的index.html模板，生成一个自动引用你打包后的JS文件的新index.html。这在每次生成的js文件名称不同时非常有用（比如添加了hash值）
        //则输出文件中最终的html页面index.html会根据模板自动生成，会自动添加所依赖的 css, js，favicon等文件，而不必手动去添加依赖项
        new HtmlWebpackPlugin({
            template: __dirname + "/app/index.html"//new 一个这个插件的实例，并传入相关的参数
        }),
        //Hot Module Replacement（HMR）也是webpack里很有用的一个插件，它允许你在修改组件代码后，自动刷新实时预览修改后的效果
        //方法：1.在webpack配置文件中添加HMR插件；
        //      2.在Webpack Dev Server中添加“hot”参数
        //HMR是一个webpack插件，它让你能浏览器中实时观察模块修改后的效果，但是如果你想让它工作，需要对模块进行额外的配额
        //Babel有一个叫做react-transform-hrm的插件，可以在不对React模块进行额外的配置的前提下让HMR正常工作
        // npm install --save-dev babel-plugin-react-transform react-transform-hmr
        /** 配置.babelrc
         *  "env": {
            "development": {
              "plugins": [["react-transform", {
                "transforms": [{
                  "transform": "react-transform-hmr",
                  "imports": ["react"],
                  "locals": ["module"]
                }]
              }]]
            }
          }
         */
        new webpack.HotModuleReplacementPlugin(),//热加载插件
        //优化插件：
        //1.OccurenceOrderPlugin :为组件分配ID，通过这个插件webpack可以分析和优先考虑使用最多的模块，并为它们分配最小的ID（内置插件）
        //2.UglifyJsPlugin：压缩JS代码（内置插件）
        //3.ExtractTextPlugin：分离CSS和JS文件（非内置插件）
        //npm install --save-dev extract-text-webpack-plugin
        // 添加命令   "build": "set NODE_ENV=production&&webpack --config ./webpack.config.js --progress"
        //执行 npm run build
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.optimize.UglifyJsPlugin(),
        new ExtractTextPlugin("style.css")
    ]
};
