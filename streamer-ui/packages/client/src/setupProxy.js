const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    ['/oidc', '/api'],
    createProxyMiddleware({
      target: 'http://localhost:9000',
      changeOrigin: false,
      logLevel: "debug",
      secure: false,
      autoRewrite: true
    })
  );
};