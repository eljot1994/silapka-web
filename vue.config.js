const { defineConfig } = require("@vue/cli-service");

module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: "/", // Ścieżka publiczna dla Firebase Hosting
});
