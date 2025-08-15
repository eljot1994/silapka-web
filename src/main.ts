import { createApp } from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import store from "./store";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import Toast, { PluginOptions, POSITION } from "vue-toastification";
import "vue-toastification/dist/index.css";

const options: PluginOptions = {
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

let app: any;

onAuthStateChanged(auth, async (user) => {
  if (!app) {
    if (user) {
      store.commit("SET_USER", { uid: user.uid, email: user.email });
      await store.dispatch("fetchUserData");
      await store.dispatch("initializeTrainingStateFromCache");
    }
    store.commit("SET_AUTH_IS_READY", true);

    app = createApp(App).use(store).use(router).use(Toast, options);
    app.mount("#app");
  }
});
