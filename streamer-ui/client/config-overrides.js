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
            "@primary-color": "#1890ff",
            "@donders-dark-red": "#8E0000",
            "@donders-ru-red": "#BE311A",
            "@donders-bright-red": "#FF0000",
            "@donders-green": "#52c41a",
        },
    }),
);
