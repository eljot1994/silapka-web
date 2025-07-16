import { createApp } from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import store from "./store";

// Inicjalizuj Vuex store z danymi z localStorage
store.dispatch("initializeAuth"); // Autentykacja jest inicjalizowana pierwsza
store.dispatch("initializeData"); // Następnie pozostałe dane

createApp(App).use(store).use(router).mount("#app");
