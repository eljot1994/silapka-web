import { createApp } from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import store from "./store";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

let app: any;

onAuthStateChanged(auth, (user) => {
  if (user) {
    store.commit("SET_USER", { uid: user.uid, email: user.email });
    store.dispatch("fetchUserData");
  } else {
    store.commit("SET_USER", null);
  }

  if (!app) {
    app = createApp(App).use(store).use(router).mount("#app");
  }

  store.commit("SET_AUTH_IS_READY", true);
});
