
 

module.exports = {
    entry : {
        "js/index" : __dirname + "/src/index.js",
        "sw" :__dirname + "/src/service-worker.js"
    },
    output: {
        filename: '[name].js',
        path: __dirname + '/'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|routes)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['env']
                    }
                }
            },
             
             

        ]
    },
     
}