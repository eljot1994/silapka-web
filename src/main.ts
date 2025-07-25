import { createApp } from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import store from "./store";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

// 1. Zaktualizuj import, dodając POSITION
import Toast, { PluginOptions, POSITION } from "vue-toastification";
import "vue-toastification/dist/index.css";

let app: any;

// Opcje konfiguracyjne dla powiadomień
const options: PluginOptions = {
  // 2. Użyj POSITION.TOP_RIGHT zamiast tekstu
  position: POSITION.TOP_RIGHT,
  timeout: 3000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: "button",
  icon: true,
  rtl: false,
};

onAuthStateChanged(auth, async (user) => {
  if (store.state.currentUser === null && user) {
    store.commit("SET_USER", { uid: user.uid, email: user.email });
    if (!store.state.authIsReady) {
      // Zapobiegaj wielokrotnemu pobieraniu danych
      await store.dispatch("fetchUserData");
    }
  }

  if (!store.state.authIsReady) {
    store.commit("SET_AUTH_IS_READY", true);
  }

  if (!app) {
    app = createApp(App)
      .use(store)
      .use(router)
      .use(Toast, options)
      .mount("#app");
  }
});
