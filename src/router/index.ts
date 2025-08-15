import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import HomeView from "../views/HomeView.vue";
import WelcomeView from "../views/WelcomeView.vue";
import ProfileView from "../views/ProfileView.vue";
import AddExerciseView from "../views/AddExerciseView.vue";
import ExerciseTypesView from "../views/ExerciseTypesView.vue";
import HistoryView from "../views/HistoryView.vue";
import TemplatesView from "../views/TemplatesView.vue";
import StatsView from "../views/StatsView.vue";
import ProfileSettingsView from "../views/ProfileSettingsView.vue";
import TrainingSummaryView from "../views/TrainingSummaryView.vue";
import { auth } from "../firebase";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/home",
    name: "home",
    component: HomeView,
  },
  {
    path: "/",
    name: "welcome",
    component: WelcomeView,
    meta: { requiresAuth: true },
  },
  {
    path: "/profile",
    name: "profile",
    component: ProfileView,
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
    path: "/summary/:id",
    name: "training-summary",
    component: TrainingSummaryView,
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
  const user = auth.currentUser;

  if (requiresAuth && !user) {
    next({ name: "home" });
  } else if (!requiresAuth && user) {
    next({ name: "welcome" });
  } else {
    next();
  }
});

export default router;
