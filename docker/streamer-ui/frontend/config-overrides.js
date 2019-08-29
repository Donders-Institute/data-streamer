const { override, fixBabelImports, addLessLoader } = require("customize-cra");

module.exports = override(
    fixBabelImports("import", {
         libraryName: "antd",
         libraryDirectory: "es",
         style: true,
    }),
    addLessLoader({
        javascriptEnabled: true,
        modifyVars: {
            "@primary-color": "#BE311A",
            "@donders-dark-red": "#8E0000",
            "@donders-ru-red": "#BE311A",
            "@donders-bright-red": "#FF0000",
        },
    }),
);
