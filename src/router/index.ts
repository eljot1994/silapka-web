import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import HomeView from "../views/HomeView.vue";
import WelcomeView from "../views/WelcomeView.vue";
import AddExerciseView from "../views/AddExerciseView.vue";
import FinishTrainingView from "../views/FinishTrainingView.vue";
import HistoryView from "../views/HistoryView.vue";
import ExerciseTypesView from "../views/ExerciseTypesView.vue";
import StatsView from "../views/StatsView.vue";
import TemplatesView from "../views/TemplatesView.vue"; // NOWY IMPORT
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
    path: "/add-exercise",
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
    path: "/finish-training",
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
    path: "/history",
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
    path: "/exercise-types",
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
  {
    path: "/stats",
    name: "stats",
    component: StatsView,
    beforeEnter: (to, from, next) => {
      if (store.getters.isAuthenticated) {
        next();
      } else {
        next({ name: "home" });
      }
    },
  },
  {
    // NOWA TRASA
    path: "/templates",
    name: "templates",
    component: TemplatesView,
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

// Ta funkcja jest ważna, ale może powodować problemy przy odświeżaniu,
// jeśli nie ma `initializeAuth`. Na razie ją zostawiamy.
router.beforeEach(async (to, from, next) => {
  if (!store.state.currentUser && localStorage.getItem("currentUser")) {
    // Zakładamy, że `onAuthStateChanged` w main.ts obsłuży logowanie
  }
  next();
});

export default router;
