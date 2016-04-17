var path = require('path');
var webpack = require('webpack');

module.exports = {
    entry: './es6/main.js',
    output: {
        path: __dirname,
        filename: 'dist/bundle.js'
    },
    module: {
        loaders: [
            {
                test: path.join(__dirname, 'es6'),
                exclude: /(node_modules|bower_components)/,
                loader: 'babel?presets[]=es2015'
              }
        ]
    },
    stats: {
        // Nice colored output
        colors: true
    },
    // Create Sourcemaps for the bundle
    devtool: 'source-map',
};
