<template>
  <div v-if="!authIsReady" class="loading-container">
    <div class="spinner"></div>
    <p>Wczytywanie danych...</p>
  </div>
  <div v-else class="page-wrapper">
    <div v-if="isRestTimerActive" class="rest-timer-overlay">
      <span>Odpoczynek: {{ restTimerSeconds }}s</span>
      <button @click="stopRestTimer">Pomiń</button>
    </div>

    <div class="welcome-header">
      <h2>Witaj, {{ userEmail }}!</h2>
    </div>

    <div class="training-section">
      <h3>Aktualny Trening</h3>
      <div v-if="isTrainingActive" class="timer">
        <span>{{ isTrainingPaused ? "Wstrzymano" : trainingTime }}</span>
      </div>

      <button
        @click="startTraining"
        v-if="!isTrainingActive && currentTraining.length > 0"
        class="action-button secondary full-width-button"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24px"
          viewBox="0 0 24 24"
          width="24px"
          fill="currentColor"
        >
          <path d="M0 0h24v24H0z" fill="none" />
          <path d="M8 5v14l11-7z" />
        </svg>
        Rozpocznij Trening
      </button>

      <div v-if="currentTraining.length === 0" class="no-exercises">
        <p>Brak zaplanowanych ćwiczeń w Twoim planie treningowym.</p>
      </div>

      <ul v-else class="exercise-list">
        <ExerciseCard
          v-for="exercise in currentTraining"
          :key="exercise.id"
          :exercise="exercise"
          :is-training-active="isTrainingActive"
          :is-training-paused="isTrainingPaused"
          @remove-exercise="removeExercise"
          @toggle-set-done="handleToggleSetDone"
          @update-set="handleUpdateSet"
          @remove-set="handleRemoveSet"
          @add-set="addSet"
          @toggle-exercise-done="toggleExerciseDone"
          @update-exercise="updateExerciseInStore"
        />
      </ul>
      <button
        @click="saveAsTemplate"
        v-if="currentTraining.length > 0 && !isTrainingActive"
        class="action-button save-template-button"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24px"
          viewBox="0 0 24 24"
          width="24px"
          fill="currentColor"
        >
          <path d="M0 0h24v24H0z" fill="none" />
          <path
            d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"
          />
        </svg>
        Zapisz jako szablon
      </button>
    </div>

    <TrainingControls
      :is-training-active="isTrainingActive"
      :is-training-paused="isTrainingPaused"
      @add-exercise="goToAddExercise"
      @pause-training="pauseTraining"
      @resume-training="resumeTraining"
      @finish-training="finishTraining"
      @cancel-training="handleCancelTraining"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, onUnmounted } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { PlannedExercise, Set } from "@/store";
import { useToast } from "vue-toastification";
import ExerciseCard from "@/components/ExerciseCard.vue";
import TrainingControls from "@/components/TrainingControls.vue";
import { useTrainingTimer } from "@/composables/useTrainingTimer"; // 1. Import nowej logiki

export default defineComponent({
  name: "WelcomeView",
  components: {
    ExerciseCard,
    TrainingControls,
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    const toast = useToast();

    // 2. Wykorzystanie composable'a do zarządzania timerem
    const {
      isTrainingActive,
      isTrainingPaused,
      trainingTime,
      startTraining,
      pauseTraining,
      resumeTraining,
    } = useTrainingTimer();

    // Pozostałe właściwości i funkcje, które nie są związane z timerem
    const authIsReady = computed(() => store.getters.authIsReady);
    const userEmail = computed(
      () => store.getters.currentUser?.email || "Gościu"
    );
    const currentTraining = computed<PlannedExercise[]>(
      () => store.getters.currentPlannedTraining
    );
    const isRestTimerActive = computed(() => store.getters.isRestTimerActive);
    const restTimerSeconds = computed(() => store.getters.restTimerSeconds);

    const handleCancelTraining = () => {
      if (
        confirm(
          "Czy na pewno chcesz anulować ten trening? Postęp nie zostanie zapisany, a licznik zostanie zresetowany."
        )
      ) {
        store.dispatch("cancelTraining");
      }
    };

    onUnmounted(() => {
      store.dispatch("stopRestTimer");
    });

    const toggleExerciseDone = (exerciseId: string) => {
      if (!isTrainingActive.value || isTrainingPaused.value) return;
      const exercise = currentTraining.value.find((ex) => ex.id === exerciseId);
      if (exercise) {
        const newDoneStatus = !exercise.done;
        const updatedExercise: PlannedExercise = {
          ...exercise,
          done: newDoneStatus,
        };
        if (exercise.category === "strength") {
          updatedExercise.sets =
            exercise.sets?.map((s) => ({ ...s, done: newDoneStatus })) || [];
        }
        store.dispatch("updateExerciseInPlan", updatedExercise);
      }
    };

    const isSetLocked = (sets: Set[] | undefined, index: number) => {
      if (!sets || index === 0) {
        return false;
      }
      return !sets[index - 1].done;
    };

    const handleToggleSetDone = ({
      exercise,
      setId,
      index,
    }: {
      exercise: PlannedExercise;
      setId: string;
      index: number;
    }) => {
      toggleSetDone(exercise, setId, index);
    };

    const toggleSetDone = (
      exercise: PlannedExercise,
      setId: string,
      index: number
    ) => {
      if (!isTrainingActive.value || isTrainingPaused.value) return;

      const sets = exercise.sets;
      if (!sets) return;

      const set = sets.find((s) => s.id === setId);
      if (!set) return;

      if (set.done) {
        const hasLaterDoneSet = sets.some((s, i) => i > index && s.done);
        if (hasLaterDoneSet) {
          toast.warning("Odznacz najpierw ostatnią wykonaną serię.");
          return;
        }
      } else {
        if (isSetLocked(sets, index)) {
          toast.warning("Ukończ najpierw poprzednią serię.");
          return;
        }
      }

      const updatedSet = { ...set, done: !set.done };
      store.dispatch("updateSet", {
        exerciseId: exercise.id,
        updatedSet,
      });

      if (updatedSet.done) {
        store.dispatch("startRestTimer");
      }
    };

    const stopRestTimer = () => store.dispatch("stopRestTimer");
    const addSet = (exerciseId: string) =>
      store.dispatch("addSet", { exerciseId });

    const handleUpdateSet = ({
      exerciseId,
      set,
    }: {
      exerciseId: string;
      set: Set;
    }) => {
      updateSetInStore(exerciseId, set);
    };
    const updateSetInStore = (exerciseId: string, set: Set) => {
      store.dispatch("updateSet", { exerciseId, updatedSet: set });
    };

    const updateExerciseInStore = (exercise: PlannedExercise) => {
      store.dispatch("updateExerciseInPlan", exercise);
    };

    const handleRemoveSet = ({
      exerciseId,
      setId,
    }: {
      exerciseId: string;
      setId: string;
    }) => {
      removeSet(exerciseId, setId);
    };
    const removeSet = (exerciseId: string, setId: string) => {
      if (confirm("Czy na pewno chcesz usunąć tę serię?")) {
        store.dispatch("removeSet", { exerciseId, setId });
      }
    };

    const removeExercise = (exerciseId: string) => {
      if (confirm("Czy na pewno chcesz usunąć to ćwiczenie z planu?")) {
        store.dispatch("removeExerciseFromPlan", exerciseId);
      }
    };

    const finishTraining = async () => {
      if (confirm("Czy na pewno chcesz zakończyć trening?")) {
        try {
          await store.dispatch("finishCurrentTraining");
          toast.success("Trening zakończony i zapisany!");
          router.push({ name: "history" });
        } catch (e: unknown) {
          const error = e as Error;
          toast.error(
            error.message || "Wystąpił błąd podczas kończenia treningu."
          );
        }
      }
    };

    const goToAddExercise = () => router.push({ name: "add-exercise" });

    const saveAsTemplate = () => {
      const name = prompt("Podaj nazwę dla szablonu:");
      if (name && name.trim() !== "") {
        store.dispatch("saveCurrentTrainingAsTemplate", name);
        toast.success(`Trening zapisany jako szablon "${name}"`);
      }
    };

    return {
      authIsReady,
      userEmail,
      currentTraining,
      isTrainingActive,
      trainingTime,
      isRestTimerActive,
      restTimerSeconds,
      isTrainingPaused,
      handleCancelTraining,
      startTraining,
      pauseTraining,
      resumeTraining,
      toggleExerciseDone,
      handleToggleSetDone,
      stopRestTimer,
      addSet,
      handleUpdateSet,
      updateExerciseInStore,
      handleRemoveSet,
      removeExercise,
      finishTraining,
      goToAddExercise,
      saveAsTemplate,
    };
  },
});
</script>

<style scoped>
/* GENERAL */
.page-wrapper {
  padding: 20px 15px 120px 15px;
  max-width: 600px;
  margin: 0 auto;
}

/* HEADER */
.welcome-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.welcome-header h2 {
  color: #2c3e50;
  font-size: 1.8em;
  margin: 0;
}

/* TRAINING SECTION */
.training-section h3 {
  font-size: 1.5em;
  color: #2c3e50;
  text-align: center;
  margin-bottom: 10px;
}
.timer {
  display: block;
  text-align: center;
  font-size: 1.2em;
  font-weight: bold;
  color: #007bff;
  margin-bottom: 20px;
}

/* EXERCISE LIST */
.exercise-list {
  list-style: none;
  padding: 0;
  margin-top: 20px;
}

/* PRZYCISKI AKCJI */
.main-actions-bar {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
}
.action-button {
  width: 100%;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 1em;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 50px;
}
.action-button.primary {
  background-color: #42b983;
  color: white;
}
.action-button.secondary {
  background-color: #007bff;
  color: white;
}
.action-button.danger {
  background-color: #dc3545;
  color: white;
}
.action-button.warning {
  background-color: #ffc107;
  color: #212529;
}
.full-width-button,
.save-template-button {
  margin-bottom: 20px;
}
.save-template-button {
  background-color: #6c757d;
  color: white;
}

/* INNE */
.no-exercises {
  text-align: center;
  padding: 40px 20px;
  background-color: #f9f9f9;
  border-radius: 12px;
  margin-top: 20px;
}
.no-exercises p {
  margin: 0;
  color: #777;
  font-style: italic;
}
.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 80vh;
}
.loading-container .spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #42b983;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.rest-timer-overlay {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  width: auto;
  min-width: 200px;
  background-color: #2c3e50;
  color: white;
  padding: 15px 25px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.2em;
  z-index: 2000;
  gap: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}
.rest-timer-overlay button {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 5px 15px;
  border-radius: 5px;
  cursor: pointer;
}
</style>
