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

let app: any; // Zmienna do przechowywania instancji aplikacji

// onAuthStateChanged to centralny punkt zarządzania autoryzacją.
// Uruchamia się raz przy starcie aplikacji oraz za każdym razem, gdy użytkownik się loguje lub wylogowuje.
onAuthStateChanged(auth, async (user) => {
  // Inicjalizuj i zamontuj aplikację tylko raz - przy pierwszym uruchomieniu onAuthStateChanged.
  if (!app) {
    if (user) {
      // Jeśli przy starcie jest zalogowany użytkownik, zaktualizuj store PRZED utworzeniem aplikacji
      store.commit("SET_USER", { uid: user.uid, email: user.email });
      await store.dispatch("fetchUserData");
    }
    // Oznacz, że autoryzacja jest gotowa, aby ukryć ekrany ładowania
    store.commit("SET_AUTH_IS_READY", true);

    // Stwórz i zamontuj aplikację
    app = createApp(App).use(store).use(router).use(Toast, options);
    app.mount("#app");
  }
});
