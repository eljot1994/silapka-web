import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import HomeView from "../views/HomeView.vue";
import WelcomeView from "../views/WelcomeView.vue";
import AddExerciseView from "../views/AddExerciseView.vue"; // Nowy import
import FinishTrainingView from "../views/FinishTrainingView.vue"; // Nowy import
import HistoryView from "../views/HistoryView.vue"; // Nowy import
import ExerciseTypesView from "../views/ExerciseTypesView.vue"; // Nowy import
import store from "../store";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "home",
    component: HomeView,
    beforeEnter: (to, from, next) => {
      if (store.getters.isAuthenticated) {
        next({ name: "welcome" });
      } else {
        next();
      }
    },
  },
  {
    path: "/welcome",
    name: "welcome",
    component: WelcomeView,
    beforeEnter: (to, from, next) => {
      if (store.getters.isAuthenticated) {
        next();
      } else {
        next({ name: "home" });
      }
    },
  },
  {
    path: "/add-exercise", // Nowa ścieżka
    name: "add-exercise",
    component: AddExerciseView,
    beforeEnter: (to, from, next) => {
      if (store.getters.isAuthenticated) {
        next();
      } else {
        next({ name: "home" });
      }
    },
  },
  {
    path: "/finish-training", // Nowa ścieżka
    name: "finish-training",
    component: FinishTrainingView,
    beforeEnter: (to, from, next) => {
      if (store.getters.isAuthenticated) {
        next();
      } else {
        next({ name: "home" });
      }
    },
  },
  {
    path: "/history", // Nowa ścieżka
    name: "history",
    component: HistoryView,
    beforeEnter: (to, from, next) => {
      if (store.getters.isAuthenticated) {
        next();
      } else {
        next({ name: "home" });
      }
    },
  },
  {
    path: "/exercise-types", // Nowa ścieżka
    name: "exercise-types",
    component: ExerciseTypesView,
    beforeEnter: (to, from, next) => {
      if (store.getters.isAuthenticated) {
        next();
      } else {
        next({ name: "home" });
      }
    },
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach(async (to, from, next) => {
  if (!store.state.user && localStorage.getItem("currentUser")) {
    await store.dispatch("initializeAuth");
  }
  next();
});

export default router;
