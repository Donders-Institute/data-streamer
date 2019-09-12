/* eslint-disable @typescript-eslint/no-var-requires */
const CracoAntDesignPlugin = require("craco-antd");

module.exports = {
    eslint: {
        mode: "file"
    },
    plugins: [
        {
            plugin: CracoAntDesignPlugin,
            options: {
                lessLoaderOptions: {
                    javascriptEnabled: true
                }
            }
        }
    ]
};
