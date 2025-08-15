import { createStore } from "vuex";
import { auth, db } from "@/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

// --- INTERFEJSY ---
interface User {
  uid: string;
  email: string;
  name?: string;
}

export type ExerciseCategory =
  | "strength"
  | "cardio"
  | "flexibility"
  | "recovery";

export interface SessionSet {
  weight: number | null;
  reps: number | null;
  done: boolean;
}

export interface ExerciseType {
  id: string;
  name: string;
  category: ExerciseCategory;
  description: string;
  imageUrl?: string;
  parties?: string[];
  lastUsedDate?: string;
  lastUsedSets?: SessionSet[];
  lastUsedDuration?: number | null;
  lastUsedReps?: number | null;
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
  duration: string;
  exercises: PlannedExercise[];
}

export interface TrainingTemplate {
  id: string;
  name: string;
  exercises: PlannedExercise[];
}

export interface LastTrainedParties {
  [party: string]: number;
}

interface UserSettings {
  restDuration: number;
}

interface State {
  currentUser: User | null;
  authIsReady: boolean;
  exerciseTypes: ExerciseType[];
  currentTraining: PlannedExercise[];
  trainingHistory: TrainingRecord[];
  trainingTemplates: TrainingTemplate[];
  isTrainingActive: boolean;
  trainingStartTime: number | null;
  lastTrainedParties: LastTrainedParties;
  isRestTimerActive: boolean;
  restTimerSeconds: number;
  restTimerInterval: ReturnType<typeof setInterval> | null; // Poprawka typowania
  isTrainingPaused: boolean;
  trainingTime: string;
  trainingTimerInterval: ReturnType<typeof setInterval> | null; // Poprawka typowania
  userSettings: UserSettings;
}

function removeUndefined(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map((item) => removeUndefined(item));
  }
  if (typeof obj === "object" && obj !== null) {
    const newObj: { [key: string]: any } = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (obj[key] !== undefined) {
          newObj[key] = removeUndefined(obj[key]);
        }
      }
    }
    return newObj;
  }
  return obj;
}

const store = createStore<State>({
  state: {
    currentUser: null,
    authIsReady: false,
    exerciseTypes: [],
    currentTraining: [],
    trainingHistory: [],
    trainingTemplates: [],
    isTrainingActive: false,
    trainingStartTime: null,
    lastTrainedParties: {},
    isRestTimerActive: false,
    restTimerSeconds: 0,
    restTimerInterval: null,
    isTrainingPaused: false,
    trainingTime: "00:00:00",
    trainingTimerInterval: null,
    userSettings: {
      restDuration: 120,
    },
  },

  getters: {
    isAuthenticated: (state) => !!state.currentUser,
    currentUser: (state) => state.currentUser,
    authIsReady: (state) => state.authIsReady,
    allExerciseTypes: (state) => state.exerciseTypes,
    getExerciseTypeById: (state) => (id: string) =>
      state.exerciseTypes.find((type) => type.id === id),
    currentPlannedTraining: (state) => state.currentTraining,
    allTrainingHistory: (state) => state.trainingHistory,
    allTrainingTemplates: (state) => state.trainingTemplates,
    isTrainingActive: (state) => state.isTrainingActive,
    lastTrainedParties: (state) => state.lastTrainedParties,
    isRestTimerActive: (state) => state.isRestTimerActive,
    restTimerSeconds: (state) => state.restTimerSeconds,
    isTrainingPaused: (state) => state.isTrainingPaused,
    trainingTime: (state) => state.trainingTime,
    userSettings: (state) => state.userSettings,
  },

  mutations: {
    SET_USER(state, user: User | null) {
      state.currentUser = user;
    },
    SET_AUTH_IS_READY(state, status: boolean) {
      state.authIsReady = status;
    },
    SET_EXERCISE_TYPES(state, types: ExerciseType[]) {
      state.exerciseTypes = types;
    },
    ADD_EXERCISE_TYPE(state, type: ExerciseType) {
      state.exerciseTypes.push(type);
    },
    UPDATE_EXERCISE_TYPE(state, updatedType: ExerciseType) {
      const index = state.exerciseTypes.findIndex(
        (t) => t.id === updatedType.id
      );
      if (index !== -1) {
        state.exerciseTypes[index] = updatedType;
      }
    },
    REMOVE_EXERCISE_TYPE(state, typeId: string) {
      state.exerciseTypes = state.exerciseTypes.filter((t) => t.id !== typeId);
    },
    SET_CURRENT_TRAINING(state, exercises: PlannedExercise[]) {
      state.currentTraining = exercises;
    },
    ADD_EXERCISE_TO_PLAN(state, exercise: PlannedExercise) {
      state.currentTraining.push(exercise);
    },
    UPDATE_EXERCISE_IN_PLAN(state, updatedExercise: PlannedExercise) {
      const index = state.currentTraining.findIndex(
        (ex) => ex.id === updatedExercise.id
      );
      if (index !== -1) {
        state.currentTraining[index] = updatedExercise;
      }
    },
    REMOVE_EXERCISE_FROM_PLAN(state, exerciseId: string) {
      state.currentTraining = state.currentTraining.filter(
        (ex) => ex.id !== exerciseId
      );
    },
    ADD_SET(
      state,
      { exerciseId, newSet }: { exerciseId: string; newSet: Set }
    ) {
      const exercise = state.currentTraining.find((ex) => ex.id === exerciseId);
      if (exercise && exercise.sets) {
        exercise.sets.push(newSet);
      }
    },
    REMOVE_SET(
      state,
      { exerciseId, setId }: { exerciseId: string; setId: string }
    ) {
      const exercise = state.currentTraining.find((ex) => ex.id === exerciseId);
      if (exercise && exercise.sets) {
        exercise.sets = exercise.sets.filter((set: Set) => set.id !== setId);
      }
    },
    SET_TRAINING_HISTORY(state, history: TrainingRecord[]) {
      state.trainingHistory = history;
    },
    ADD_TRAINING_TO_HISTORY(state, training: TrainingRecord) {
      state.trainingHistory.unshift(training);
    },
    REMOVE_TRAINING_FROM_HISTORY(state, trainingId: string) {
      state.trainingHistory = state.trainingHistory.filter(
        (t) => t.id !== trainingId
      );
    },
    CLEAR_CURRENT_TRAINING(state) {
      state.currentTraining = [];
    },
    SET_TRAINING_ACTIVE(state, status: boolean) {
      state.isTrainingActive = status;
      if (!status) {
        state.trainingStartTime = null;
      }
    },
    SET_TRAINING_START_TIME(state, time: number | null) {
      state.trainingStartTime = time;
    },
    SET_TRAINING_TEMPLATES(state, templates: TrainingTemplate[]) {
      state.trainingTemplates = templates;
    },
    ADD_TRAINING_TEMPLATE(state, template: TrainingTemplate) {
      state.trainingTemplates.push(template);
    },
    REMOVE_TEMPLATE(state, templateId: string) {
      state.trainingTemplates = state.trainingTemplates.filter(
        (t) => t.id !== templateId
      );
    },
    SET_LAST_TRAINED_PARTIES(state, parties: LastTrainedParties) {
      state.lastTrainedParties = parties;
    },
    SET_REST_TIMER_ACTIVE(state, isActive: boolean) {
      state.isRestTimerActive = isActive;
    },
    SET_REST_TIMER_SECONDS(state, seconds: number) {
      state.restTimerSeconds = seconds;
    },
    SET_REST_TIMER_INTERVAL(
      state,
      interval: ReturnType<typeof setInterval> | null
    ) {
      state.restTimerInterval = interval;
    },
    CLEAR_REST_TIMER_INTERVAL(state) {
      if (state.restTimerInterval) {
        clearInterval(state.restTimerInterval);
        state.restTimerInterval = null;
      }
    },
    SET_TRAINING_PAUSED(state, status: boolean) {
      state.isTrainingPaused = status;
    },
    SET_TRAINING_TIME(state, time: string) {
      state.trainingTime = time;
    },
    SET_TRAINING_TIMER_INTERVAL(
      state,
      interval: ReturnType<typeof setInterval> | null
    ) {
      state.trainingTimerInterval = interval;
    },
    CLEAR_TRAINING_TIMER_INTERVAL(state) {
      if (state.trainingTimerInterval) {
        clearInterval(state.trainingTimerInterval);
        state.trainingTimerInterval = null;
      }
    },
    SET_USER_SETTINGS(state, settings: UserSettings) {
      state.userSettings = settings;
    },
  },

  actions: {
    initializeTrainingStateFromCache({ commit, dispatch, state }) {
      const startTime = localStorage.getItem("trainingStartTime");
      const isPaused = localStorage.getItem("isTrainingPaused") === "true";

      if (
        startTime &&
        !isNaN(Number(startTime)) &&
        state.currentTraining.length > 0
      ) {
        commit("SET_TRAINING_START_TIME", Number(startTime));
        commit("SET_TRAINING_PAUSED", isPaused);
        commit("SET_TRAINING_ACTIVE", true);

        if (!isPaused) {
          dispatch("startTrainingTimer");
        } else {
          dispatch("updateTrainingTime");
        }
      }
    },
    startRestTimer({ commit, dispatch, state }, duration?: number) {
      const restTime = duration ?? state.userSettings.restDuration;
      dispatch("stopRestTimer");
      commit("SET_REST_TIMER_SECONDS", restTime);
      commit("SET_REST_TIMER_ACTIVE", true);

      const interval = setInterval(() => {
        commit("SET_REST_TIMER_SECONDS", state.restTimerSeconds - 1);
        if (state.restTimerSeconds <= 0) {
          dispatch("stopRestTimer");
        }
      }, 1000);
      commit("SET_REST_TIMER_INTERVAL", interval);
    },
    stopRestTimer({ commit }) {
      commit("CLEAR_REST_TIMER_INTERVAL");
      commit("SET_REST_TIMER_ACTIVE", false);
    },
    updateTrainingTime({ commit, state }) {
      const startTime = state.trainingStartTime;
      if (startTime) {
        const diff = Math.floor((Date.now() - startTime) / 1000);
        const h = Math.floor(diff / 3600)
          .toString()
          .padStart(2, "0");
        const m = Math.floor((diff % 3600) / 60)
          .toString()
          .padStart(2, "0");
        const s = (diff % 60).toString().padStart(2, "0");
        commit("SET_TRAINING_TIME", `${h}:${m}:${s}`);
      } else {
        commit("SET_TRAINING_TIME", "00:00:00");
      }
    },
    startTrainingTimer({ commit, dispatch }) {
      commit("CLEAR_TRAINING_TIMER_INTERVAL");
      const interval = setInterval(() => {
        dispatch("updateTrainingTime");
      }, 1000);
      commit("SET_TRAINING_TIMER_INTERVAL", interval);
    },
    stopTrainingTimer({ commit }) {
      commit("CLEAR_TRAINING_TIMER_INTERVAL");
    },
    startTraining({ commit, dispatch }) {
      const startTime = Date.now();
      localStorage.setItem("trainingStartTime", String(startTime));
      localStorage.setItem("isTrainingPaused", "false");

      commit("SET_TRAINING_START_TIME", startTime);
      commit("SET_TRAINING_ACTIVE", true);
      commit("SET_TRAINING_PAUSED", false);
      dispatch("startTrainingTimer");
    },
    pauseTraining({ commit, dispatch }) {
      localStorage.setItem("isTrainingPaused", "true");
      commit("SET_TRAINING_PAUSED", true);
      dispatch("stopTrainingTimer");
    },
    resumeTraining({ commit, dispatch }) {
      localStorage.setItem("isTrainingPaused", "false");
      commit("SET_TRAINING_PAUSED", false);
      dispatch("startTrainingTimer");
    },
    cancelTraining({ commit, dispatch }) {
      dispatch("stopTrainingTimer");
      commit("SET_TRAINING_PAUSED", false);
      commit("SET_TRAINING_ACTIVE", false);
      commit("SET_TRAINING_TIME", "00:00:00");
      localStorage.removeItem("trainingStartTime");
      localStorage.removeItem("isTrainingPaused");
    },
    async signup({ commit }, { email, password }) {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      if (res.user) {
        const userRef = doc(db, "users", res.user.uid);
        const userData = removeUndefined({
          email: res.user.email,
          exerciseTypes: [],
          currentTraining: [],
          trainingHistory: [],
          trainingTemplates: [],
          lastTrainedParties: {},
          userSettings: { restDuration: 120 },
        });
        await setDoc(userRef, userData);
        commit("SET_USER", { uid: res.user.uid, email: res.user.email });
      } else {
        throw new Error("Could not complete signup");
      }
    },
    // --- POPRAWIONA AKCJA LOGIN ---
    async login({ commit }, { email, password }) {
      const res = await signInWithEmailAndPassword(auth, email, password);
      if (res.user) {
        commit("SET_USER", { uid: res.user.uid, email: res.user.email });
      } else {
        throw new Error("Could not complete login");
      }
    },
    async logout({ commit, dispatch }) {
      await signOut(auth);
      localStorage.removeItem("trainingStartTime");
      localStorage.removeItem("isTrainingPaused");
      dispatch("stopTrainingTimer");
      commit("SET_TRAINING_PAUSED", false);
      commit("SET_USER", null);
      commit("SET_EXERCISE_TYPES", []);
      commit("SET_CURRENT_TRAINING", []);
      commit("SET_TRAINING_HISTORY", []);
      commit("SET_TRAINING_TEMPLATES", []);
      commit("SET_TRAINING_ACTIVE", false);
      commit("SET_LAST_TRAINED_PARTIES", {});
      commit("SET_USER_SETTINGS", { restDuration: 120 });
    },
    async fetchUserData({ commit, state }) {
      if (state.currentUser) {
        const userRef = doc(db, "users", state.currentUser.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          commit("SET_EXERCISE_TYPES", data.exerciseTypes || []);
          commit("SET_CURRENT_TRAINING", data.currentTraining || []);
          commit("SET_TRAINING_HISTORY", data.trainingHistory || []);
          commit("SET_TRAINING_TEMPLATES", data.trainingTemplates || []);
          commit("SET_LAST_TRAINED_PARTIES", data.lastTrainedParties || {});
          commit(
            "SET_USER_SETTINGS",
            data.userSettings || { restDuration: 120 }
          );
        }
      }
    },
    async updateUserSettings({ commit, state }, newSettings: UserSettings) {
      if (state.currentUser) {
        const userRef = doc(db, "users", state.currentUser.uid);
        await updateDoc(userRef, {
          userSettings: newSettings,
        });
        commit("SET_USER_SETTINGS", newSettings);
      }
    },
    async addExerciseType({ commit, state }, type: Omit<ExerciseType, "id">) {
      if (state.currentUser) {
        const newType: ExerciseType = {
          ...type,
          id: uuidv4(),
          parties: type.parties || [],
        };
        const userRef = doc(db, "users", state.currentUser.uid);
        const cleanedNewType = removeUndefined(newType);
        await updateDoc(userRef, {
          exerciseTypes: arrayUnion(cleanedNewType),
        });
        commit("ADD_EXERCISE_TYPE", newType);
      }
    },
    async updateExerciseType({ commit, state }, updatedType: ExerciseType) {
      if (state.currentUser) {
        const userRef = doc(db, "users", state.currentUser.uid);
        const oldType = state.exerciseTypes.find(
          (t) => t.id === updatedType.id
        );
        if (oldType) {
          await updateDoc(userRef, {
            exerciseTypes: arrayRemove(removeUndefined(oldType)),
          });
          await updateDoc(userRef, {
            exerciseTypes: arrayUnion(removeUndefined(updatedType)),
          });
        }
        commit("UPDATE_EXERCISE_TYPE", updatedType);
      }
    },
    async deleteExerciseType({ commit, state }, typeId: string) {
      if (state.currentUser) {
        const typeToRemove = state.exerciseTypes.find((t) => t.id === typeId);
        if (typeToRemove) {
          const userRef = doc(db, "users", state.currentUser.uid);
          const cleanedTypeToRemove = removeUndefined(typeToRemove);
          await updateDoc(userRef, {
            exerciseTypes: arrayRemove(cleanedTypeToRemove),
          });
          commit("REMOVE_EXERCISE_TYPE", typeId);
        }
      }
    },
    async addExerciseToPlan(
      { commit, state, getters },
      exerciseTypeId: string
    ) {
      if (state.currentUser) {
        const exerciseType = getters.getExerciseTypeById(exerciseTypeId);
        if (!exerciseType) throw new Error("Exercise type not found.");

        const newExercise: PlannedExercise = {
          id: uuidv4(),
          exerciseTypeId: exerciseType.id,
          name: exerciseType.name,
          category: exerciseType.category,
          done: false,
        };

        if (exerciseType.category === "strength") {
          newExercise.sets = exerciseType.lastUsedSets?.map(
            (s: SessionSet) => ({
              ...s,
              id: uuidv4(),
              done: false,
            })
          ) || [{ id: uuidv4(), weight: null, reps: null, done: false }];
        } else if (exerciseType.category === "cardio") {
          newExercise.duration = exerciseType.lastUsedDuration ?? 0;
        } else if (exerciseType.category === "flexibility") {
          newExercise.reps = exerciseType.lastUsedReps ?? 0;
          newExercise.duration = exerciseType.lastUsedDuration ?? 0;
        } else if (exerciseType.category === "recovery") {
          newExercise.duration = exerciseType.lastUsedDuration ?? 0;
        }

        const userRef = doc(db, "users", state.currentUser.uid);
        const cleanedNewExercise = removeUndefined(newExercise);
        await updateDoc(userRef, {
          currentTraining: arrayUnion(cleanedNewExercise),
        });
        commit("ADD_EXERCISE_TO_PLAN", newExercise);
      }
    },
    async updateExerciseInPlan(
      { commit, state },
      updatedExercise: PlannedExercise
    ) {
      if (state.currentUser) {
        const userRef = doc(db, "users", state.currentUser.uid);
        const currentTrainingCopy = JSON.parse(
          JSON.stringify(state.currentTraining)
        );
        const index = currentTrainingCopy.findIndex(
          (ex: PlannedExercise) => ex.id === updatedExercise.id
        );
        if (index !== -1) {
          currentTrainingCopy[index] = updatedExercise;
          const cleanedCurrentTraining = removeUndefined(currentTrainingCopy);
          await updateDoc(userRef, {
            currentTraining: cleanedCurrentTraining,
          });
          commit("SET_CURRENT_TRAINING", currentTrainingCopy);
        }
      }
    },
    async removeExerciseFromPlan({ commit, state }, exerciseId: string) {
      if (state.currentUser) {
        const exerciseToRemove = state.currentTraining.find(
          (ex) => ex.id === exerciseId
        );
        if (exerciseToRemove) {
          const userRef = doc(db, "users", state.currentUser.uid);
          const cleanedExerciseToRemove = removeUndefined(exerciseToRemove);
          await updateDoc(userRef, {
            currentTraining: arrayRemove(cleanedExerciseToRemove),
          });
          commit("REMOVE_EXERCISE_FROM_PLAN", exerciseId);
        }
      }
    },
    async addSet({ commit, state }, { exerciseId }: { exerciseId: string }) {
      if (state.currentUser) {
        const currentTrainingCopy = JSON.parse(
          JSON.stringify(state.currentTraining)
        );
        const exerciseIndex = currentTrainingCopy.findIndex(
          (ex: PlannedExercise) => ex.id === exerciseId
        );

        if (exerciseIndex > -1) {
          const exercise = currentTrainingCopy[exerciseIndex];
          if (exercise.sets) {
            const lastSet = exercise.sets[exercise.sets.length - 1];
            const newSet = {
              id: uuidv4(),
              weight: lastSet ? lastSet.weight : null,
              reps: lastSet ? lastSet.reps : null,
              done: false,
            };
            exercise.sets.push(newSet);

            const userRef = doc(db, "users", state.currentUser.uid);
            const cleanedCurrentTraining = removeUndefined(currentTrainingCopy);
            await updateDoc(userRef, {
              currentTraining: cleanedCurrentTraining,
            });
            commit("SET_CURRENT_TRAINING", currentTrainingCopy);
          }
        }
      }
    },
    async updateSet({ commit, state }, { exerciseId, updatedSet }) {
      if (state.currentUser) {
        const currentTrainingCopy = JSON.parse(
          JSON.stringify(state.currentTraining)
        );
        const exerciseIndex = currentTrainingCopy.findIndex(
          (ex: PlannedExercise) => ex.id === exerciseId
        );

        if (exerciseIndex > -1) {
          const exercise = currentTrainingCopy[exerciseIndex];
          if (exercise.sets) {
            const setIndex = exercise.sets.findIndex(
              (set: Set) => set.id === updatedSet.id
            );
            if (setIndex > -1) {
              exercise.sets[setIndex] = updatedSet;

              const allSetsDone = exercise.sets.every((s: Set) => s.done);
              if (exercise.done !== allSetsDone) {
                exercise.done = allSetsDone;
              }
            }

            const userRef = doc(db, "users", state.currentUser.uid);
            const cleanedCurrentTraining = removeUndefined(currentTrainingCopy);
            await updateDoc(userRef, {
              currentTraining: cleanedCurrentTraining,
            });
            commit("SET_CURRENT_TRAINING", currentTrainingCopy);
          }
        }
      }
    },
    async removeSet({ commit, state }, { exerciseId, setId }) {
      if (state.currentUser) {
        const currentTrainingCopy = JSON.parse(
          JSON.stringify(state.currentTraining)
        );
        const exercise = currentTrainingCopy.find(
          (ex: PlannedExercise) => ex.id === exerciseId
        );
        if (exercise && exercise.sets) {
          exercise.sets = exercise.sets.filter((set: Set) => set.id !== setId);

          const allSetsDone = exercise.sets.every((s: Set) => s.done);
          if (exercise.done !== allSetsDone) {
            exercise.done = allSetsDone;
          }

          const userRef = doc(db, "users", state.currentUser.uid);
          const cleanedCurrentTraining = removeUndefined(currentTrainingCopy);
          await updateDoc(userRef, {
            currentTraining: cleanedCurrentTraining,
          });
          commit("SET_CURRENT_TRAINING", currentTrainingCopy);
        }
      }
    },
    async finishCurrentTraining({ commit, state, dispatch }) {
      if (state.currentUser) {
        const hasAnyExerciseDone = state.currentTraining.some(
          (ex) => ex.done || (ex.sets && ex.sets.some((s) => s.done))
        );
        if (!hasAnyExerciseDone) {
          throw new Error(
            "Nie możesz zakończyć treningu bez wykonania żadnego ćwiczenia."
          );
        }

        const endTime = Date.now();
        const startTime = state.trainingStartTime || endTime;
        const currentDate = new Date().toLocaleDateString("pl-PL");
        const durationInSeconds = Math.round((endTime - startTime) / 1000);
        const hours = Math.floor(durationInSeconds / 3600);
        const minutes = Math.floor((durationInSeconds % 3600) / 60);
        const seconds = durationInSeconds % 60;
        const durationFormatted = `${hours
          .toString()
          .padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds
          .toString()
          .padStart(2, "0")}`;

        const newLastTrainedParties: LastTrainedParties = {
          ...state.lastTrainedParties,
        };

        const updatedExerciseTypes = JSON.parse(
          JSON.stringify(state.exerciseTypes)
        );

        state.currentTraining.forEach((exercise) => {
          if (
            exercise.done ||
            (exercise.sets && exercise.sets.some((s) => s.done))
          ) {
            const typeIndex = updatedExerciseTypes.findIndex(
              (t: ExerciseType) => t.id === exercise.exerciseTypeId
            );
            if (typeIndex > -1) {
              const updatedType = updatedExerciseTypes[typeIndex];
              updatedType.lastUsedDate = currentDate;
              updatedType.lastUsedSets = exercise.sets
                ? exercise.sets.map(({ id: _id, ...rest }) => rest)
                : undefined;
              updatedType.lastUsedDuration = exercise.duration;
              updatedType.lastUsedReps = exercise.reps;

              if (updatedType.parties) {
                updatedType.parties.forEach((party: string) => {
                  newLastTrainedParties[party] = endTime;
                });
              }
            }
          }
        });

        const completedTraining: TrainingRecord = {
          id: uuidv4(),
          date: currentDate,
          duration: durationFormatted,
          exercises: state.currentTraining,
        };

        const userRef = doc(db, "users", state.currentUser.uid);

        await updateDoc(userRef, {
          trainingHistory: arrayUnion(removeUndefined(completedTraining)),
          currentTraining: [],
          exerciseTypes: removeUndefined(updatedExerciseTypes),
          lastTrainedParties: removeUndefined(newLastTrainedParties),
        });

        localStorage.removeItem("trainingStartTime");
        localStorage.removeItem("isTrainingPaused");

        commit("ADD_TRAINING_TO_HISTORY", completedTraining);
        commit("SET_EXERCISE_TYPES", updatedExerciseTypes);
        commit("SET_LAST_TRAINED_PARTIES", newLastTrainedParties);
        commit("CLEAR_CURRENT_TRAINING");

        dispatch("stopTrainingTimer");
        commit("SET_TRAINING_PAUSED", false);
        commit("SET_TRAINING_ACTIVE", false);

        // Zwracamy ukończony trening, aby WelcomeView mogło użyć jego ID do przekierowania
        return completedTraining;
      }
      // Dodajemy return, aby uniknąć błędu "not all code paths return a value"
      return null;
    },
    async deleteTrainingFromHistory({ commit, state }, trainingId: string) {
      if (state.currentUser) {
        const trainingToRemove = state.trainingHistory.find(
          (t) => t.id === trainingId
        );
        if (trainingToRemove) {
          const userRef = doc(db, "users", state.currentUser.uid);
          const cleanedTrainingToRemove = removeUndefined(trainingToRemove);
          await updateDoc(userRef, {
            trainingHistory: arrayRemove(cleanedTrainingToRemove),
          });
          commit("REMOVE_TRAINING_FROM_HISTORY", trainingId);
        }
      }
    },
    async saveCurrentTrainingAsTemplate(
      { commit, state },
      templateName: string
    ) {
      if (state.currentUser && state.currentTraining.length > 0) {
        const newTemplate: TrainingTemplate = {
          id: uuidv4(),
          name: templateName,
          exercises: removeUndefined(
            JSON.parse(JSON.stringify(state.currentTraining))
          ),
        };
        const userRef = doc(db, "users", state.currentUser.uid);
        const cleanedNewTemplate = removeUndefined(newTemplate);
        await updateDoc(userRef, {
          trainingTemplates: arrayUnion(cleanedNewTemplate),
        });
        commit("ADD_TRAINING_TEMPLATE", newTemplate);
      }
    },
    async loadTemplateIntoCurrentTraining(
      { commit, state },
      templateId: string
    ) {
      if (state.currentUser) {
        const template = state.trainingTemplates.find(
          (t) => t.id === templateId
        );
        if (template) {
          const exercisesFromTemplate = JSON.parse(
            JSON.stringify(template.exercises)
          );

          const preparedExercises = exercisesFromTemplate.map(
            (ex: PlannedExercise) => {
              const newEx = { ...ex, id: uuidv4(), done: false };
              if (newEx.sets) {
                newEx.sets = newEx.sets.map((s: Set) => ({
                  ...s,
                  id: uuidv4(),
                  done: false,
                }));
              }
              return newEx;
            }
          );

          const userRef = doc(db, "users", state.currentUser.uid);
          const cleanedPreparedExercises = removeUndefined(preparedExercises);
          await updateDoc(userRef, {
            currentTraining: cleanedPreparedExercises,
          });
          commit("SET_CURRENT_TRAINING", preparedExercises);
        }
      }
    },
    async deleteTemplate({ commit, state }, templateId: string) {
      if (state.currentUser) {
        const templateToRemove = state.trainingTemplates.find(
          (t) => t.id === templateId
        );
        if (templateToRemove) {
          const userRef = doc(db, "users", state.currentUser.uid);
          const cleanedTemplateToRemove = removeUndefined(templateToRemove);
          await updateDoc(userRef, {
            trainingTemplates: arrayRemove(cleanedTemplateToRemove),
          });
          commit("REMOVE_TEMPLATE", templateId);
        }
      }
    },
  },
});

export default store;
