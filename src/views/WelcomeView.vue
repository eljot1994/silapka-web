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
        <li
          v-for="exercise in currentTraining"
          :key="exercise.id"
          class="exercise-card"
          :class="{
            'exercise-done': exercise.done,
          }"
        >
          <div class="card-header">
            <span class="exercise-name">{{ exercise.name }}</span>
            <button
              @click="removeExercise(exercise.id)"
              class="icon-button remove-exercise-button"
              title="Usuń ćwiczenie z planu"
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
                  d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
                />
              </svg>
            </button>
          </div>

          <div class="card-content">
            <template v-if="exercise.category === 'strength'">
              <ul class="set-list">
                <li
                  v-for="(set, index) in exercise.sets"
                  :key="set.id"
                  class="set-item"
                  :class="{ 'set-done': set.done }"
                >
                  <button
                    @click="toggleSetDone(exercise, set.id, index)"
                    class="set-status-button"
                    :disabled="
                      !isTrainingActive ||
                      isTrainingPaused ||
                      isSetLocked(exercise.sets, index)
                    "
                  >
                    <span v-if="!set.done" class="set-index">{{
                      index + 1
                    }}</span>
                    <svg
                      v-else
                      class="set-check-icon"
                      xmlns="http://www.w3.org/2000/svg"
                      height="24px"
                      viewBox="0 0 24 24"
                      width="24px"
                      fill="white"
                    >
                      <path d="M0 0h24v24H0z" fill="none" />
                      <path
                        d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
                      />
                    </svg>
                  </button>
                  <div class="set-inputs">
                    <div class="input-group">
                      <label :for="`weight-${set.id}`">Ciężar (kg)</label>
                      <input
                        :id="`weight-${set.id}`"
                        type="number"
                        v-model.number="set.weight"
                        @input="updateSetInStore(exercise.id, set)"
                        placeholder="0"
                      />
                    </div>
                    <div class="input-group">
                      <label :for="`reps-${set.id}`">Powtórzenia</label>
                      <input
                        :id="`reps-${set.id}`"
                        type="number"
                        v-model.number="set.reps"
                        @input="updateSetInStore(exercise.id, set)"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <button
                    @click="removeSet(exercise.id, set.id)"
                    class="icon-button remove-set-button"
                    title="Usuń serię"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="24px"
                      viewBox="0 0 24 24"
                      width="24px"
                      fill="currentColor"
                    >
                      <path d="M0 0h24v24H0V0z" fill="none" />
                      <path
                        d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                      />
                    </svg>
                  </button>
                </li>
              </ul>
              <button @click="addSet(exercise.id)" class="add-set-button">
                + Dodaj serię
              </button>
            </template>

            <template v-else>
              <div class="other-exercise-wrapper">
                <button
                  @click="toggleExerciseDone(exercise.id)"
                  class="set-status-button"
                  :class="{ done: exercise.done }"
                  :disabled="!isTrainingActive || isTrainingPaused"
                >
                  <svg
                    v-if="exercise.done"
                    class="set-check-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    height="24px"
                    viewBox="0 0 24 24"
                    width="24px"
                    fill="white"
                  >
                    <path d="M0 0h24v24H0z" fill="none" />
                    <path
                      d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
                    />
                  </svg>
                </button>
                <div class="other-exercise-inputs">
                  <div
                    class="input-group"
                    v-if="exercise.duration !== undefined"
                  >
                    <label>Długość (min)</label>
                    <input
                      type="number"
                      v-model.number="exercise.duration"
                      @input="updateExerciseInStore(exercise)"
                      placeholder="0"
                    />
                  </div>
                  <div class="input-group" v-if="exercise.reps !== undefined">
                    <label>Powtórzenia</label>
                    <input
                      type="number"
                      v-model.number="exercise.reps"
                      @input="updateExerciseInStore(exercise)"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            </template>
          </div>
        </li>
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

    <div class="main-actions-bar">
      <button @click="goToAddExercise" class="action-button primary">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24px"
          viewBox="0 0 24 24"
          width="24px"
          fill="currentColor"
        >
          <path d="M0 0h24v24H0z" fill="none" />
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
        </svg>
        Dodaj ćwiczenie
      </button>

      <button
        @click="pauseTraining"
        v-if="isTrainingActive && !isTrainingPaused"
        class="action-button warning"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24px"
          viewBox="0 0 24 24"
          width="24px"
          fill="currentColor"
        >
          <path d="M0 0h24v24H0z" fill="none" />
          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
        </svg>
        Zatrzymaj
      </button>

      <button
        @click="resumeTraining"
        v-if="isTrainingActive && isTrainingPaused"
        class="action-button secondary"
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
        Wznów
      </button>

      <button
        @click="finishTraining"
        v-if="isTrainingActive"
        class="action-button danger"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24px"
          viewBox="0 0 24 24"
          width="24px"
          fill="currentColor"
        >
          <path d="M0 0h24v24H0z" fill="none" />
          <path d="M6 6h12v12H6z" />
        </svg>
        Zakończ
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, onUnmounted } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { PlannedExercise, Set } from "@/store";
import { useToast } from "vue-toastification";

export default defineComponent({
  name: "WelcomeView",
  setup() {
    const store = useStore();
    const router = useRouter();
    const toast = useToast();

    const authIsReady = computed(() => store.getters.authIsReady);
    const userEmail = computed(
      () => store.getters.currentUser?.email || "Gościu"
    );
    const currentTraining = computed<PlannedExercise[]>(
      () => store.getters.currentPlannedTraining
    );
    const finishTrainingError = ref<string | null>(null);
    const isTrainingActive = computed(() => store.getters.isTrainingActive);
    const isRestTimerActive = computed(() => store.getters.isRestTimerActive);
    const restTimerSeconds = computed(() => store.getters.restTimerSeconds);

    const isTrainingPaused = computed(() => store.getters.isTrainingPaused);
    const trainingTime = computed(() => store.getters.trainingTime);

    const startTraining = () => store.dispatch("startTraining");
    const pauseTraining = () => store.dispatch("pauseTraining");
    const resumeTraining = () => store.dispatch("resumeTraining");

    onUnmounted(() => {
      store.dispatch("stopRestTimer");
    });

    const isSetLocked = (sets: Set[] | undefined, index: number) => {
      if (!sets || index === 0) {
        return false;
      }
      return !sets[index - 1].done;
    };

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

      // Logika dla ODZNACZANIA
      if (set.done) {
        const hasLaterDoneSet = sets.some((s, i) => i > index && s.done);
        if (hasLaterDoneSet) {
          toast.warning("Odznacz najpierw ostatnią wykonaną serię.");
          return;
        }
      }
      // Logika dla ZAZNACZANIA
      else {
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

    const stopRestTimer = () => {
      store.dispatch("stopRestTimer");
    };

    const addSet = (exerciseId: string) => {
      store.dispatch("addSet", { exerciseId });
    };

    const updateSetInStore = (exerciseId: string, set: Set) => {
      store.dispatch("updateSet", { exerciseId, updatedSet: set });
    };

    const updateExerciseInStore = (exercise: PlannedExercise) => {
      store.dispatch("updateExerciseInPlan", exercise);
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
        finishTrainingError.value = null;
        try {
          await store.dispatch("finishCurrentTraining");
          toast.success("Trening zakończony i zapisany!");
          router.push({ name: "history" });
        } catch (error: any) {
          toast.error(
            error.message || "Wystąpił błąd podczas kończenia treningu."
          );
          finishTrainingError.value =
            error.message || "Wystąpił błąd podczas kończenia treningu.";
        }
      }
    };

    const goToAddExercise = () => {
      router.push({ name: "add-exercise" });
    };

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
      finishTrainingError,
      isTrainingActive,
      trainingTime,
      isRestTimerActive,
      restTimerSeconds,
      isTrainingPaused,
      startTraining,
      pauseTraining,
      resumeTraining,
      isSetLocked,
      toggleExerciseDone,
      toggleSetDone,
      stopRestTimer,
      addSet,
      updateSetInStore,
      updateExerciseInStore,
      removeSet,
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
.exercise-card {
  background-color: #fff;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  border: 1px solid #e8e8e8;
}
.exercise-done > .card-header {
  border-left: 5px solid #42b983;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background-color: #f7f9fc;
  border-left: 5px solid transparent;
}
.exercise-name {
  font-weight: bold;
  font-size: 1.2em;
}
.remove-exercise-button {
  color: #888;
}
.card-content {
  padding: 15px;
}

/* SET & OTHER EXERCISE STATUS BUTTON */
.set-status-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 2px solid #ccc;
  background-color: #fff;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s;
}
.set-status-button:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
  opacity: 0.6;
}
.set-status-button.done,
.set-item.set-done .set-status-button {
  background-color: #42b983;
  border-color: #42b983;
}
.set-check-icon {
  fill: white;
}
.set-index {
  font-size: 1.2em;
  font-weight: bold;
  color: #333;
}

/* UKŁAD SERII */
.set-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.set-item {
  display: flex;
  align-items: center;
  gap: 15px;
}
.set-inputs {
  display: flex;
  flex-grow: 1;
  gap: 10px;
  min-width: 0;
}
.input-group {
  display: flex;
  flex-direction: column;
  flex: 1;
}
.input-group label {
  font-size: 0.8em;
  color: #666;
  margin-bottom: 4px;
}
.input-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  text-align: center;
  font-size: 1.1em;
}
.remove-set-button {
  color: #e57373;
  flex-shrink: 0;
}
.add-set-button {
  background: none;
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 10px;
  width: 100%;
  margin-top: 15px;
  color: #666;
  font-weight: bold;
}

/* UKŁAD POZOSTAŁYCH ĆWICZEŃ */
.other-exercise-wrapper {
  display: flex;
  gap: 15px;
  align-items: center;
}
.other-exercise-inputs {
  flex-grow: 1;
  display: flex;
  gap: 15px;
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
.icon-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  display: flex;
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
