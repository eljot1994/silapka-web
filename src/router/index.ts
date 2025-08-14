import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import HomeView from "../views/HomeView.vue";
import WelcomeView from "../views/WelcomeView.vue";
import AddExerciseView from "../views/AddExerciseView.vue";
import ExerciseTypesView from "../views/ExerciseTypesView.vue";
import HistoryView from "../views/HistoryView.vue";
import FinishTrainingView from "../views/FinishTrainingView.vue";
import TemplatesView from "../views/TemplatesView.vue";
import StatsView from "../views/StatsView.vue";
// NOWE IMPORTY
import ProfileView from "../views/ProfileView.vue";
import ProfileSettingsView from "../views/ProfileSettingsView.vue";
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
    meta: { requiresAuth: true },
  },
  {
    path: "/add-exercise",
    name: "add-exercise",
    component: AddExerciseView,
    meta: { requiresAuth: true },
  },
  {
    path: "/exercise-types",
    name: "exercise-types",
    component: ExerciseTypesView,
    meta: { requiresAuth: true },
  },
  {
    path: "/history",
    name: "history",
    component: HistoryView,
    meta: { requiresAuth: true },
  },
  {
    path: "/finish-training",
    name: "finish-training",
    component: FinishTrainingView,
    meta: { requiresAuth: true },
  },
  {
    path: "/templates",
    name: "templates",
    component: TemplatesView,
    meta: { requiresAuth: true },
  },
  {
    path: "/stats",
    name: "stats",
    component: StatsView,
    meta: { requiresAuth: true },
  },
  // NOWE ŚCIEŻKI
  {
    path: "/profile",
    name: "profile",
    component: ProfileView,
    meta: { requiresAuth: true },
  },
  {
    path: "/settings",
    name: "settings",
    component: ProfileSettingsView,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  if (requiresAuth && !store.getters.isAuthenticated) {
    next({ name: "home" });
  } else {
    next();
  }
});

export default router;
