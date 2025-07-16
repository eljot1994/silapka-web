import { createStore } from "vuex";
import router from "../router";

// Interfejsy danych (pozostałe bez zmian)
interface User {
  email: string;
}

export interface ExerciseType {
  id: string;
  name: string;
  category: "cardio" | "strength";
  description: string;
  imageUrl?: string;
}

// NOWY INTERFEJS DLA SERII SIŁOWYCH
export interface Set {
  id: string; // Unikalne ID dla każdej serii
  weight: number | null; // waga w kg
  reps: number | null; // powtórzenia w serii
  done: boolean; // Czy seria została wykonana
}

export interface PlannedExercise {
  id: string; // ID konkretnego zaplanowanego ćwiczenia (unikalne dla planu)
  exerciseTypeId: string;
  name: string;
  category: "cardio" | "strength";
  // Parametry treningowe
  sets?: Set[]; // Zmieniamy z liczby serii na TABLICĘ OBIEKTÓW SERII dla strength
  duration?: number | null; // długość w minutach (dla kardio)
  done: boolean; // Czy całe ćwiczenie zostało zakończone (opcjonalne, ale przydatne)
}

export interface TrainingRecord {
  id: string;
  date: string;
  exercises: PlannedExercise[];
  totalDuration?: number;
}

interface State {
  user: User | null;
  exerciseTypes: ExerciseType[];
  currentTraining: PlannedExercise[];
  trainingHistory: TrainingRecord[];
  userStats: any;
}

export default createStore<State>({
  state: {
    user: null,
    exerciseTypes: [],
    currentTraining: [],
    trainingHistory: [],
    userStats: {},
  },
  getters: {
    isAuthenticated: (state) => !!state.user,
    currentUser: (state) => state.user,
    allExerciseTypes: (state) => state.exerciseTypes,
    getExerciseTypeById: (state) => (id: string) =>
      state.exerciseTypes.find((type) => type.id === id),
    currentPlannedTraining: (state) => state.currentTraining,
    allTrainingHistory: (state) => state.trainingHistory,
    getUserStats: (state) => state.userStats,
  },
  mutations: {
    // ... (Mutacje dotyczące autentykacji, setExerciseTypes, addExerciseType - bez zmian)
    setUser(state, user: User | null) {
      /* ... */
    },
    setExerciseTypes(state, types: ExerciseType[]) {
      /* ... */
    },
    addExerciseType(state, type: ExerciseType) {
      /* ... */
    },

    // --- Bieżący trening (aktualizujemy) ---
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
    // NOWA MUTACJA: Dodanie serii do ćwiczenia siłowego
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
    // NOWA MUTACJA: Aktualizacja serii w ćwiczeniu siłowym
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
    // NOWA MUTACJA: Usunięcie serii z ćwiczenia siłowego
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

    // ... (Mutacje dotyczące historii i statystyk - bez zmian, bo `PlannedExercise` jest używany)
    addTrainingToHistory(state, training: TrainingRecord) {
      /* ... */
    },
    setTrainingHistory(state, history: TrainingRecord[]) {
      /* ... */
    },
    setUserStats(state, stats: any) {
      /* ... */
    },
  },
  actions: {
    // ... (Akcje autentykacji i initializeData - bez zmian)
    initializeAuth({ commit }) {
      /* ... */
    },
    register({ commit }, { email, password }: any) {
      /* ... */
    },
    login({ commit }, { email, password }: any) {
      /* ... */
    },
    logout({ commit }) {
      /* ... */
    },
    initializeData({ commit }) {
      /* ... */
    },

    // --- Akcje dla typów ćwiczeń (bez zmian) ---
    addExerciseType({ commit }, type: Omit<ExerciseType, "id">) {
      /* ... */
    },

    // --- Akcje dla bieżącego treningu (aktualizujemy) ---
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
        done: false, // Domyślnie ćwiczenie jako całość jest "niezrobione"
      };

      if (exerciseType.category === "strength") {
        newPlannedExercise.sets = []; // Dla siłowych, początkowo pusta tablica serii
      } else if (exerciseType.category === "cardio") {
        newPlannedExercise.duration = params.duration; // Dla kardio, długość
      }
      commit("addExerciseToCurrentTraining", newPlannedExercise);
    },
    removeExerciseFromPlan({ commit }, exerciseId: string) {
      commit("removeExerciseFromCurrentTraining", exerciseId);
    },
    updateExerciseInPlan({ commit }, updatedExercise: PlannedExercise) {
      commit("updatePlannedExercise", updatedExercise);
    },
    // NOWA AKCJA: Dodanie serii do ćwiczenia
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
    // NOWA AKCJA: Aktualizacja serii
    updateSet(
      { commit },
      { exerciseId, updatedSet }: { exerciseId: string; updatedSet: Set }
    ) {
      commit("updateSetInExercise", { exerciseId, updatedSet });
    },
    // NOWA AKCJA: Usunięcie serii
    removeSet(
      { commit },
      { exerciseId, setId }: { exerciseId: string; setId: string }
    ) {
      commit("removeSetFromExercise", { exerciseId, setId });
    },

    // --- Akcje dla zakończenia treningu (aktualizujemy) ---
    finishCurrentTraining({ commit, state }) {
      const currentTrainingExercises = state.currentTraining;

      // Sprawdzamy, czy jakieś ćwiczenie zostało w ogóle rozpoczęte/zaznaczone
      const hasAnyExerciseDone = currentTrainingExercises.some((ex) => {
        if (ex.category === "strength" && ex.sets) {
          return ex.sets.some((s) => s.done); // Czy choć jedna seria wykonana
        } else if (ex.category === "cardio") {
          return ex.done; // Czy kardio wykonane
        }
        return false;
      });

      if (!hasAnyExerciseDone) {
        throw new Error(
          "Musisz wykonać co najmniej jedną serię ćwiczenia siłowego lub jedno ćwiczenie kardio, aby zakończyć trening."
        );
      }

      // Możesz też zdecydować, czy zapisać tylko te zrobione, czy wszystkie z flagami.
      // Na razie: zapisujemy cały plan, ale zaktualizowany status "done" dla poszczególnych serii/ćwiczeń.
      const newTrainingRecord: TrainingRecord = {
        id: Date.now().toString(),
        date: new Date().toISOString().split("T")[0],
        exercises: JSON.parse(JSON.stringify(currentTrainingExercises)), // Głęboka kopia, by nie mutować bieżącego stanu
      };
      commit("addTrainingToHistory", newTrainingRecord);

      // Aktualizacja statystyk
      const currentStats = state.userStats;
      currentStats.totalTrainings = (currentStats.totalTrainings || 0) + 1;
      // Obliczanie totalExercisesDone może być bardziej złożone teraz, np. liczba wykonanych serii
      let completedSetsCount = 0;
      let completedCardioCount = 0;
      currentTrainingExercises.forEach((ex) => {
        if (ex.category === "strength" && ex.sets) {
          completedSetsCount += ex.sets.filter((s) => s.done).length;
        } else if (ex.category === "cardio" && ex.done) {
          completedCardioCount++;
        }
      });
      currentStats.totalCompletedSets =
        (currentStats.totalCompletedSets || 0) + completedSetsCount;
      currentStats.totalCompletedCardio =
        (currentStats.totalCompletedCardio || 0) + completedCardioCount;

      commit("setUserStats", currentStats);
    },
  },
  modules: {},
});
