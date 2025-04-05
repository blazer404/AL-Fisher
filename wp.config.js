const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
    mode: 'production',
    output: {
        filename: 'main.js'
    },
    optimization: {
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    keep_classnames: false,
                    keep_fnames: false,
                    compress: {
                        unused: true,
                        drop_console: false //логи можно убрать тут
                    },
                    format: {
                        comments: false
                    },
                    mangle: {
                        module: true,
                    }
                },
                extractComments: false
            }),
        ],
    },
    module: {
        rules: [
            {
                test: /\.(js)$/,
                exclude: /(node_modules)/,
            }
        ]
    },
    resolve: {
        extensions: ['.js']
    },
};
