import { createStore } from "vuex";
import router from "../router";

interface User {
  email: string;
}

export type ExerciseCategory =
  | "strength"
  | "cardio"
  | "flexibility"
  | "recovery";

export interface ExerciseType {
  id: string;
  name: string;
  category: ExerciseCategory;
  description: string;
  imageUrl?: string;
}

export interface Set {
  id: string;
  weight: number | null;
  reps: number | null;
  done: boolean;
}

export interface PlannedExercise {
  id: string;
  exerciseTypeId: string;
  name: string;
  category: ExerciseCategory;
  done: boolean;
  sets?: Set[];
  duration?: number | null;
  reps?: number | null;
}

export interface TrainingRecord {
  id: string;
  date: string;
  exercises: PlannedExercise[];
}

interface State {
  currentUser: User | null;
  exerciseTypes: ExerciseType[];
  currentTraining: PlannedExercise[];
  trainingHistory: TrainingRecord[];
  userStats: any;
}

export default createStore<State>({
  state: {
    currentUser: null,
    exerciseTypes: [],
    currentTraining: [],
    trainingHistory: [],
    userStats: {},
  },
  getters: {
    isAuthenticated: (state) => !!state.currentUser,
    currentUser: (state) => state.currentUser,
    allExerciseTypes: (state) => state.exerciseTypes,
    getExerciseTypeById: (state) => (id: string) =>
      state.exerciseTypes.find((type) => type.id === id),
    currentPlannedTraining: (state) => state.currentTraining,
    allTrainingHistory: (state) => state.trainingHistory,
    getUserStats: (state) => state.userStats,
  },
  mutations: {
    setUser(state, user: User | null) {
      state.currentUser = user;
      if (user) {
        localStorage.setItem("currentUser", JSON.stringify(user));
      } else {
        localStorage.removeItem("currentUser");
      }
    },
    setExerciseTypes(state, types: ExerciseType[]) {
      state.exerciseTypes = types;
      localStorage.setItem("exerciseTypes", JSON.stringify(types));
    },
    addExerciseType(state, type: ExerciseType) {
      state.exerciseTypes.push(type);
      localStorage.setItem(
        "exerciseTypes",
        JSON.stringify(state.exerciseTypes)
      );
    },
    setCurrentTraining(state, exercises: PlannedExercise[]) {
      state.currentTraining = exercises;
      localStorage.setItem("currentTraining", JSON.stringify(exercises));
    },
    addExerciseToCurrentTraining(state, exercise: PlannedExercise) {
      state.currentTraining.push(exercise);
      localStorage.setItem(
        "currentTraining",
        JSON.stringify(state.currentTraining)
      );
    },
    removeExerciseFromCurrentTraining(state, exerciseId: string) {
      state.currentTraining = state.currentTraining.filter(
        (ex) => ex.id !== exerciseId
      );
      localStorage.setItem(
        "currentTraining",
        JSON.stringify(state.currentTraining)
      );
    },
    updatePlannedExercise(state, updatedExercise: PlannedExercise) {
      const index = state.currentTraining.findIndex(
        (ex) => ex.id === updatedExercise.id
      );
      if (index !== -1) {
        state.currentTraining.splice(index, 1, updatedExercise);
        localStorage.setItem(
          "currentTraining",
          JSON.stringify(state.currentTraining)
        );
      }
    },
    addSetToExercise(
      state,
      { exerciseId, newSet }: { exerciseId: string; newSet: Set }
    ) {
      const exercise = state.currentTraining.find((ex) => ex.id === exerciseId);
      if (exercise && exercise.category === "strength") {
        if (!exercise.sets) {
          exercise.sets = [];
        }
        exercise.sets.push(newSet);
        localStorage.setItem(
          "currentTraining",
          JSON.stringify(state.currentTraining)
        );
      }
    },
    updateSetInExercise(
      state,
      { exerciseId, updatedSet }: { exerciseId: string; updatedSet: Set }
    ) {
      const exercise = state.currentTraining.find((ex) => ex.id === exerciseId);
      if (exercise && exercise.category === "strength" && exercise.sets) {
        const setIndex = exercise.sets.findIndex((s) => s.id === updatedSet.id);
        if (setIndex !== -1) {
          exercise.sets.splice(setIndex, 1, updatedSet);
          localStorage.setItem(
            "currentTraining",
            JSON.stringify(state.currentTraining)
          );
        }
      }
    },
    removeSetFromExercise(
      state,
      { exerciseId, setId }: { exerciseId: string; setId: string }
    ) {
      const exercise = state.currentTraining.find((ex) => ex.id === exerciseId);
      if (exercise && exercise.category === "strength" && exercise.sets) {
        exercise.sets = exercise.sets.filter((s) => s.id !== setId);
        localStorage.setItem(
          "currentTraining",
          JSON.stringify(state.currentTraining)
        );
      }
    },
    addTrainingToHistory(state, training: TrainingRecord) {
      state.trainingHistory.push(training);
      localStorage.setItem(
        "trainingHistory",
        JSON.stringify(state.trainingHistory)
      );
      state.currentTraining = [];
      localStorage.removeItem("currentTraining");
    },
    setTrainingHistory(state, history: TrainingRecord[]) {
      state.trainingHistory = history;
      localStorage.setItem("trainingHistory", JSON.stringify(history));
    },
    setUserStats(state, stats: any) {
      state.userStats = stats;
      localStorage.setItem("userStats", JSON.stringify(stats));
    },
  },
  actions: {
    initializeAuth({ commit }) {
      const storedUser = localStorage.getItem("currentUser");
      if (storedUser) {
        try {
          commit("setUser", JSON.parse(storedUser));
        } catch (e) {
          console.error(
            "Błąd podczas ładowania użytkownika z localStorage:",
            e
          );
          commit("setUser", null);
        }
      }
    },
    async register({ commit }, { email, password }: any) {
      const existingUsers = JSON.parse(
        localStorage.getItem("registeredUsers") || "[]"
      );
      if (existingUsers.some((u: any) => u.email === email)) {
        throw new Error("Użytkownik o podanym adresie email już istnieje.");
      }
      if (password.length < 6) {
        throw new Error("Hasło musi mieć co najmniej 6 znaków.");
      }
      const newUser = { email, password };
      existingUsers.push(newUser);
      localStorage.setItem("registeredUsers", JSON.stringify(existingUsers));
    },
    async login({ commit }, { email, password }: any) {
      const registeredUsers = JSON.parse(
        localStorage.getItem("registeredUsers") || "[]"
      );
      const userFound = registeredUsers.find(
        (u: any) => u.email === email && u.password === password
      );

      if (userFound) {
        const user: User = { email: userFound.email };
        commit("setUser", user);
        router.push({ name: "welcome" });
      } else {
        throw new Error("Nieprawidłowy email lub hasło.");
      }
    },
    async logout({ commit }) {
      commit("setUser", null);
      router.push({ name: "home" });
    },
    initializeData({ commit }) {
      const storedExerciseTypes = localStorage.getItem("exerciseTypes");
      if (storedExerciseTypes) {
        try {
          commit("setExerciseTypes", JSON.parse(storedExerciseTypes));
        } catch (e) {
          console.error("Błąd ładowania typów ćwiczeń:", e);
        }
      }
      const storedCurrentTraining = localStorage.getItem("currentTraining");
      if (storedCurrentTraining) {
        try {
          commit("setCurrentTraining", JSON.parse(storedCurrentTraining));
        } catch (e) {
          console.error("Błąd ładowania bieżącego treningu:", e);
        }
      }
      const storedTrainingHistory = localStorage.getItem("trainingHistory");
      if (storedTrainingHistory) {
        try {
          commit("setTrainingHistory", JSON.parse(storedTrainingHistory));
        } catch (e) {
          console.error("Błąd ładowania historii treningów:", e);
        }
      }
      const storedUserStats = localStorage.getItem("userStats");
      if (storedUserStats) {
        try {
          commit("setUserStats", JSON.parse(storedUserStats));
        } catch (e) {
          console.error("Błąd ładowania statystyk użytkownika:", e);
        }
      }
    },
    addExerciseType({ commit }, type: Omit<ExerciseType, "id">) {
      const newType: ExerciseType = { ...type, id: Date.now().toString() };
      commit("addExerciseType", newType);
    },
    addExerciseToPlan(
      { commit, getters },
      { exerciseTypeId, params }: { exerciseTypeId: string; params: any }
    ) {
      const exerciseType = getters.getExerciseTypeById(exerciseTypeId);
      if (!exerciseType) {
        throw new Error("Wybrany typ ćwiczenia nie istnieje.");
      }
      const newPlannedExercise: PlannedExercise = {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
        exerciseTypeId: exerciseType.id,
        name: exerciseType.name,
        category: exerciseType.category,
        done: false,
        ...params,
      };

      if (newPlannedExercise.category === "strength") {
        newPlannedExercise.sets = [];
      }
      commit("addExerciseToCurrentTraining", newPlannedExercise);
    },
    removeExerciseFromPlan({ commit }, exerciseId: string) {
      commit("removeExerciseFromCurrentTraining", exerciseId);
    },
    updateExerciseInPlan({ commit }, updatedExercise: PlannedExercise) {
      commit("updatePlannedExercise", updatedExercise);
    },
    addSet(
      { commit },
      {
        exerciseId,
        weight,
        reps,
      }: { exerciseId: string; weight: number | null; reps: number | null }
    ) {
      const newSet: Set = {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
        weight,
        reps,
        done: false,
      };
      commit("addSetToExercise", { exerciseId, newSet });
    },
    updateSet(
      { commit },
      { exerciseId, updatedSet }: { exerciseId: string; updatedSet: Set }
    ) {
      commit("updateSetInExercise", { exerciseId, updatedSet });
    },
    removeSet(
      { commit },
      { exerciseId, setId }: { exerciseId: string; setId: string }
    ) {
      commit("removeSetFromExercise", { exerciseId, setId });
    },
    finishCurrentTraining({ commit, state }) {
      const currentTrainingExercises = state.currentTraining;
      const hasAnyExerciseDone = currentTrainingExercises.some((ex) => {
        if (ex.category === "strength" && ex.sets) {
          return ex.sets.some((s) => s.done);
        } else {
          return ex.done;
        }
      });

      if (!hasAnyExerciseDone) {
        throw new Error(
          "Musisz wykonać co najmniej jedno ćwiczenie, aby zakończyć trening."
        );
      }

      const newTrainingRecord: TrainingRecord = {
        id: Date.now().toString(),
        date: new Date().toISOString().split("T")[0],
        exercises: JSON.parse(JSON.stringify(currentTrainingExercises)),
      };
      commit("addTrainingToHistory", newTrainingRecord);

      const currentStats = state.userStats;
      currentStats.totalTrainings = (currentStats.totalTrainings || 0) + 1;
      let completedSetsCount = 0;
      let completedCardioCount = 0;
      let completedFlexibilityCount = 0;
      let completedRecoveryCount = 0; // NOWA STATYSTYKA
      currentTrainingExercises.forEach((ex) => {
        if (ex.category === "strength" && ex.sets) {
          completedSetsCount += ex.sets.filter((s) => s.done).length;
        } else if (ex.category === "cardio" && ex.done) {
          completedCardioCount++;
        } else if (ex.category === "flexibility" && ex.done) {
          completedFlexibilityCount++;
        } else if (ex.category === "recovery" && ex.done) {
          completedRecoveryCount++;
        }
      });
      currentStats.totalCompletedSets =
        (currentStats.totalCompletedSets || 0) + completedSetsCount;
      currentStats.totalCompletedCardio =
        (currentStats.totalCompletedCardio || 0) + completedCardioCount;
      currentStats.totalCompletedFlexibility =
        (currentStats.totalCompletedFlexibility || 0) +
        completedFlexibilityCount;
      currentStats.totalCompletedRecovery =
        (currentStats.totalCompletedRecovery || 0) + completedRecoveryCount;

      commit("setUserStats", currentStats);
    },
  },
  modules: {},
});
