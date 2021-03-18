var path = require('path');

module.exports = {
	mode: 'development',
    entry: './src/index.js',
	devtool: 'inline-source-map',
    output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'dist')
    }, 
    devServer: {
	    contentBase: './dist'
	},
	module: {
		rules: [
			{
				test: /\.scss?$/i,
				use: ['style-loader','css-loader', 'sass-loader']
			},
			{
				test: /\.(png|svg|jpg|jpeg|gif)$/i,
				type: 'asset/resource',
			}
		]
	}
};