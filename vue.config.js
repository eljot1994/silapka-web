const { defineConfig } = require("@vue/cli-service");

// Użyj nazwy repozytorium jako ścieżki publicznej w produkcji
const publicPath =
  process.env.NODE_ENV === "production"
    ? "/silapka-web/" // Zastąp "silapka-web" nazwą swojego repozytorium
    : "/";

module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: publicPath,
});
