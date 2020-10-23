const path = require('path');

module.exports = {
  // Файл, с которого начинается клиентская часть Universal web app
  entry: {
    client: './src/client.js'
  },
  // Директория, в которой будет лежать билд webpack'а
  output: {
    path: path.resolve(__dirname, 'public'),
    publicPath: '/'
  },
  module: {
  // Используем babel-loader для компиляции кода из ECMAScript в понятный браузеру
  // JavaScript. Полученные файлы будут находиться в директории /public
    rules: [
      { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
    ]
  }
}