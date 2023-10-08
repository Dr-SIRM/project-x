const { createProxyMiddleware } = require("http-proxy-middleware");
const { API_BASE_URL } = require("./config");

module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: `${API_BASE_URL}`,
      changeOrigin: true, // Keep this line
      secure: false,
      logLevel: "debug", // This will help us see more detailed logs
      pathRewrite: {
        "^/api": "",
      },
    })
  );
};
