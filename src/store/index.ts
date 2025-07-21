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
  duration: string;
  exercises: PlannedExercise[];
}

export interface TrainingTemplate {
  id: string;
  name: string;
  exercises: PlannedExercise[];
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
  userStats: any;
}

// --- STORE ---
export default createStore<State>({
  state: {
    currentUser: null,
    authIsReady: false,
    exerciseTypes: [],
    currentTraining: [],
    trainingHistory: [],
    trainingTemplates: [],
    isTrainingActive: false,
    trainingStartTime: null,
    userStats: {},
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
    getUserStats: (state) => state.userStats,
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
    UPDATE_SET(
      state,
      { exerciseId, updatedSet }: { exerciseId: string; updatedSet: Set }
    ) {
      const exercise = state.currentTraining.find((ex) => ex.id === exerciseId);
      if (exercise && exercise.sets) {
        const setIndex = exercise.sets.findIndex(
          (set) => set.id === updatedSet.id
        );
        if (setIndex !== -1) {
          exercise.sets[setIndex] = updatedSet;
        }
      }
    },
    REMOVE_SET(
      state,
      { exerciseId, setId }: { exerciseId: string; setId: string }
    ) {
      const exercise = state.currentTraining.find((ex) => ex.id === exerciseId);
      if (exercise && exercise.sets) {
        exercise.sets = exercise.sets.filter((set) => set.id !== setId);
      }
    },
    SET_TRAINING_HISTORY(state, history: TrainingRecord[]) {
      state.trainingHistory = history;
    },
    ADD_TRAINING_TO_HISTORY(state, training: TrainingRecord) {
      state.trainingHistory.unshift(training); // *** ZMIANA Z .push na .unshift ***
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
      if (status) {
        state.trainingStartTime = Date.now();
      } else {
        state.trainingStartTime = null;
      }
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
  },

  actions: {
    async signup({ commit }, { email, password }) {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      if (res.user) {
        const userRef = doc(db, "users", res.user.uid);
        await setDoc(userRef, {
          email: res.user.email,
          exerciseTypes: [],
          currentTraining: [],
          trainingHistory: [],
          trainingTemplates: [],
        });
        commit("SET_USER", { uid: res.user.uid, email: res.user.email });
      } else {
        throw new Error("Could not complete signup");
      }
    },
    async login({ commit }, { email, password }) {
      const res = await signInWithEmailAndPassword(auth, email, password);
      if (res.user) {
        commit("SET_USER", { uid: res.user.uid, email: res.user.email });
      } else {
        throw new Error("Could not complete login");
      }
    },
    async logout({ commit }) {
      await signOut(auth);
      commit("SET_USER", null);
      commit("SET_EXERCISE_TYPES", []);
      commit("SET_CURRENT_TRAINING", []);
      commit("SET_TRAINING_HISTORY", []);
      commit("SET_TRAINING_TEMPLATES", []);
      commit("SET_TRAINING_ACTIVE", false);
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
        }
      }
    },
    async addExerciseType({ commit, state }, type: Omit<ExerciseType, "id">) {
      if (state.currentUser) {
        const newType: ExerciseType = { ...type, id: uuidv4() };
        const userRef = doc(db, "users", state.currentUser.uid);
        await updateDoc(userRef, {
          exerciseTypes: arrayUnion(newType),
        });
        commit("ADD_EXERCISE_TYPE", newType);
      }
    },
    async updateExerciseType({ commit, state }, updatedType: ExerciseType) {
      if (state.currentUser) {
        const userRef = doc(db, "users", state.currentUser.uid);
        const updatedTypes = state.exerciseTypes.map((t) =>
          t.id === updatedType.id ? updatedType : t
        );
        await updateDoc(userRef, { exerciseTypes: updatedTypes });
        commit("UPDATE_EXERCISE_TYPE", updatedType);
      }
    },
    async deleteExerciseType({ commit, state }, typeId: string) {
      if (state.currentUser) {
        const typeToRemove = state.exerciseTypes.find((t) => t.id === typeId);
        if (typeToRemove) {
          const userRef = doc(db, "users", state.currentUser.uid);
          await updateDoc(userRef, {
            exerciseTypes: arrayRemove(typeToRemove),
          });
          commit("REMOVE_EXERCISE_TYPE", typeId);
        }
      }
    },
    async addExerciseToPlan(
      { commit, state, getters },
      { exerciseTypeId, params }: { exerciseTypeId: string; params: any }
    ) {
      if (state.currentUser) {
        const exerciseType = getters.getExerciseTypeById(exerciseTypeId);
        if (!exerciseType) {
          throw new Error("Exercise type not found.");
        }

        const newExercise: PlannedExercise = {
          id: uuidv4(),
          exerciseTypeId: exerciseType.id,
          name: exerciseType.name,
          category: exerciseType.category,
          done: false,
          ...params,
        };

        if (newExercise.category === "strength") {
          newExercise.sets = [
            { id: uuidv4(), weight: null, reps: null, done: false },
          ];
        }

        const userRef = doc(db, "users", state.currentUser.uid);
        await updateDoc(userRef, {
          currentTraining: arrayUnion(newExercise),
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
        const currentTraining = [...state.currentTraining];
        const index = currentTraining.findIndex(
          (ex) => ex.id === updatedExercise.id
        );
        if (index !== -1) {
          currentTraining[index] = updatedExercise;
          await updateDoc(userRef, { currentTraining: currentTraining });
          commit("UPDATE_EXERCISE_IN_PLAN", updatedExercise);
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
          await updateDoc(userRef, {
            currentTraining: arrayRemove(exerciseToRemove),
          });
          commit("REMOVE_EXERCISE_FROM_PLAN", exerciseId);
        }
      }
    },
    async addSet({ commit, state }, { exerciseId, weight, reps }) {
      if (state.currentUser) {
        const exercise = state.currentTraining.find(
          (ex) => ex.id === exerciseId
        );
        if (exercise && exercise.sets) {
          const newSet = { id: uuidv4(), weight, reps, done: false };
          const updatedExercise = {
            ...exercise,
            sets: [...exercise.sets, newSet],
          };
          const userRef = doc(db, "users", state.currentUser.uid);
          await updateDoc(userRef, {
            currentTraining: state.currentTraining.map((ex) =>
              ex.id === exerciseId ? updatedExercise : ex
            ),
          });
          commit("ADD_SET", { exerciseId, newSet });
        }
      }
    },
    async updateSet({ commit, state }, { exerciseId, updatedSet }) {
      if (state.currentUser) {
        const exercise = state.currentTraining.find(
          (ex) => ex.id === exerciseId
        );
        if (exercise && exercise.sets) {
          const updatedSets = exercise.sets.map((set) =>
            set.id === updatedSet.id ? updatedSet : set
          );
          const updatedExercise = { ...exercise, sets: updatedSets };
          const userRef = doc(db, "users", state.currentUser.uid);
          await updateDoc(userRef, {
            currentTraining: state.currentTraining.map((ex) =>
              ex.id === exerciseId ? updatedExercise : ex
            ),
          });
          commit("UPDATE_SET", { exerciseId, updatedSet });
        }
      }
    },
    async removeSet({ commit, state }, { exerciseId, setId }) {
      if (state.currentUser) {
        const exercise = state.currentTraining.find(
          (ex) => ex.id === exerciseId
        );
        if (exercise && exercise.sets) {
          const updatedSets = exercise.sets.filter((set) => set.id !== setId);
          const updatedExercise = { ...exercise, sets: updatedSets };
          const userRef = doc(db, "users", state.currentUser.uid);
          await updateDoc(userRef, {
            currentTraining: state.currentTraining.map((ex) =>
              ex.id === exerciseId ? updatedExercise : ex
            ),
          });
          commit("REMOVE_SET", { exerciseId, setId });
        }
      }
    },
    async finishCurrentTraining({ commit, state }) {
      if (state.currentUser) {
        const hasAnyExerciseDone = state.currentTraining.some((ex) => ex.done);
        if (!hasAnyExerciseDone) {
          throw new Error(
            "Nie możesz zakończyć treningu bez wykonania żadnego ćwiczenia."
          );
        }

        const endTime = Date.now();
        const startTime = state.trainingStartTime || endTime;
        const durationInSeconds = Math.round((endTime - startTime) / 1000);
        const hours = Math.floor(durationInSeconds / 3600);
        const minutes = Math.floor((durationInSeconds % 3600) / 60);
        const seconds = durationInSeconds % 60;
        const durationFormatted = `${hours
          .toString()
          .padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds
          .toString()
          .padStart(2, "0")}`;

        const completedTraining: TrainingRecord = {
          id: uuidv4(),
          date: new Date().toLocaleDateString("pl-PL"),
          duration: durationFormatted,
          exercises: state.currentTraining,
        };

        const userRef = doc(db, "users", state.currentUser.uid);
        await updateDoc(userRef, {
          trainingHistory: arrayUnion(completedTraining),
          currentTraining: [],
        });

        commit("ADD_TRAINING_TO_HISTORY", completedTraining);
        commit("CLEAR_CURRENT_TRAINING");
        commit("SET_TRAINING_ACTIVE", false);
      }
    },
    async deleteTrainingFromHistory({ commit, state }, trainingId: string) {
      if (state.currentUser) {
        const trainingToRemove = state.trainingHistory.find(
          (t) => t.id === trainingId
        );
        if (trainingToRemove) {
          const userRef = doc(db, "users", state.currentUser.uid);
          await updateDoc(userRef, {
            trainingHistory: arrayRemove(trainingToRemove),
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
          exercises: JSON.parse(JSON.stringify(state.currentTraining)),
        };
        const userRef = doc(db, "users", state.currentUser.uid);
        await updateDoc(userRef, {
          trainingTemplates: arrayUnion(newTemplate),
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
          const userRef = doc(db, "users", state.currentUser.uid);
          await updateDoc(userRef, {
            currentTraining: template.exercises,
          });
          commit("SET_CURRENT_TRAINING", template.exercises);
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
          await updateDoc(userRef, {
            trainingTemplates: arrayRemove(templateToRemove),
          });
          commit("REMOVE_TEMPLATE", templateId);
        }
      }
    },
  },
});
