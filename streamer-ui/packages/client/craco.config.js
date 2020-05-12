/* eslint-disable @typescript-eslint/no-var-requires */
const CracoAntDesignPlugin = require("craco-antd");

module.exports = {
    eslint: {
        enable: false
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
