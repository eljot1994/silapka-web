<template>
  <div v-if="!authIsReady" class="loading-container">
    <div class="spinner"></div>
    <p>Wczytywanie danych...</p>
  </div>
  <div v-else class="welcome-container">
    <div v-if="isRestTimerActive" class="rest-timer-overlay">
      <span>Odpoczynek: {{ restTimerSeconds }}s</span>
      <button @click="stopRestTimer">Pomiń</button>
    </div>

    <h2>Witaj, {{ userEmail }}!</h2>
    <button @click="handleLogout" class="logout-button">Wyloguj</button>

    <hr />

    <div class="training-section">
      <h3>
        Najbliższy trening
        <span v-if="isTrainingActive" class="timer">{{ trainingTime }}</span>
      </h3>

      <div
        v-if="!isTrainingActive && currentTraining.length > 0"
        class="training-actions"
      >
        <button @click="startTraining" class="action-button primary">
          Rozpocznij Trening
        </button>
      </div>

      <p v-if="currentTraining.length === 0" class="no-exercises">
        Brak zaplanowanych ćwiczeń na ten trening. Dodaj nowe, aby zacząć!
      </p>
      <ul v-else class="exercise-list">
        <li
          v-for="exercise in currentTraining"
          :key="exercise.id"
          class="exercise-item"
          :class="{
            'exercise-done': exercise.done,
            'active-training': isTrainingActive,
          }"
        >
          <div class="exercise-header">
            <span class="exercise-name">{{ exercise.name }}</span>
            <input
              type="checkbox"
              title="Oznacz jako wykonane (tylko podczas treningu)"
              :checked="exercise.done"
              :disabled="!isTrainingActive"
              @change="toggleExerciseDone(exercise.id)"
            />
            <button @click="removeExercise(exercise.id)" class="remove-button">
              Usuń
            </button>
          </div>

          <div class="exercise-content">
            <template v-if="exercise.category === 'strength'">
              <h4>Serie:</h4>
              <ul class="set-list">
                <li
                  v-for="set in exercise.sets"
                  :key="set.id"
                  class="set-item"
                  :class="{ 'set-done': set.done }"
                >
                  <label>
                    Waga (kg):
                    <input
                      type="number"
                      v-model.number="set.weight"
                      @input="updateSetInStore(exercise.id, set)"
                    />
                  </label>
                  <label>
                    Powt.:
                    <input
                      type="number"
                      v-model.number="set.reps"
                      @input="updateSetInStore(exercise.id, set)"
                    />
                  </label>
                  <input
                    type="checkbox"
                    title="Oznacz jako wykonane (tylko podczas treningu)"
                    :checked="set.done"
                    :disabled="!isTrainingActive"
                    @change="toggleSetDone(exercise.id, set.id)"
                  />
                  <button
                    @click="removeSet(exercise.id, set.id)"
                    class="remove-set-button"
                  >
                    Usuń
                  </button>
                </li>
              </ul>
              <button @click="addSet(exercise.id)" class="add-set-button">
                Dodaj serię
              </button>
            </template>

            <template v-else-if="exercise.category === 'cardio'">
              <label>
                Długość (min):
                <input
                  type="number"
                  v-model.number="exercise.duration"
                  @input="updateExerciseInStore(exercise)"
                />
              </label>
            </template>

            <template v-else-if="exercise.category === 'flexibility'">
              <label v-if="exercise.reps !== undefined">
                Powtórzenia:
                <input
                  type="number"
                  v-model.number="exercise.reps"
                  @input="updateExerciseInStore(exercise)"
                />
              </label>
              <label v-if="exercise.duration !== undefined">
                Długość (min):
                <input
                  type="number"
                  v-model.number="exercise.duration"
                  @input="updateExerciseInStore(exercise)"
                />
              </label>
            </template>

            <template v-else-if="exercise.category === 'recovery'">
              <label>
                Długość (min):
                <input
                  type="number"
                  v-model.number="exercise.duration"
                  @input="updateExerciseInStore(exercise)"
                />
              </label>
            </template>
          </div>
        </li>
      </ul>

      <div class="training-actions">
        <button @click="goToAddExercise" class="action-button primary">
          Dodaj ćwiczenie
        </button>
        <button
          @click="saveAsTemplate"
          v-if="currentTraining.length > 0"
          class="action-button"
        >
          Zapisz jako szablon
        </button>
        <button @click="goToTemplates" class="action-button">
          Wczytaj szablon
        </button>
        <button
          @click="finishTraining"
          v-if="isTrainingActive"
          class="action-button secondary"
        >
          Zakończ trening
        </button>
      </div>
      <p v-if="finishTrainingError" class="error-message">
        {{ finishTrainingError }}
      </p>
    </div>

    <hr />

    <div class="navigation-section">
      <h3>Nawigacja</h3>
      <div class="nav-buttons">
        <button @click="goToTemplates" class="nav-button">
          Szablony Treningów
        </button>
        <button @click="goToHistory" class="nav-button">Historia</button>
        <button @click="goToExerciseTypes" class="nav-button">
          Typy ćwiczeń
        </button>
        <button @click="goToStats" class="nav-button">Statystyki</button>
      </div>
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
    const trainingTime = ref("00:00:00");
    let timerInterval: number | undefined;

    const isRestTimerActive = computed(() => store.getters.isRestTimerActive);
    const restTimerSeconds = computed(() => store.getters.restTimerSeconds);

    const startTraining = () => {
      store.commit("SET_TRAINING_ACTIVE", true);
      timerInterval = window.setInterval(() => {
        const startTime = store.state.trainingStartTime;
        if (startTime) {
          const diff = Math.floor((Date.now() - startTime) / 1000);
          const h = Math.floor(diff / 3600)
            .toString()
            .padStart(2, "0");
          const m = Math.floor((diff % 3600) / 60)
            .toString()
            .padStart(2, "0");
          const s = (diff % 60).toString().padStart(2, "0");
          trainingTime.value = `${h}:${m}:${s}`;
        }
      }, 1000);
    };

    onUnmounted(() => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
      store.dispatch("stopRestTimer");
    });

    const handleLogout = () => {
      store.dispatch("logout");
      router.push({ name: "home" });
    };

    const toggleExerciseDone = (exerciseId: string) => {
      if (!isTrainingActive.value) return;
      const exercise = currentTraining.value.find((ex) => ex.id === exerciseId);
      if (exercise) {
        if (
          exercise.category === "cardio" ||
          exercise.category === "flexibility" ||
          exercise.category === "recovery"
        ) {
          const updatedExercise = { ...exercise, done: !exercise.done };
          store.dispatch("updateExerciseInPlan", updatedExercise);
        } else if (exercise.category === "strength") {
          const newDoneStatus = !exercise.done;
          const updatedSets =
            exercise.sets?.map((s) => ({ ...s, done: newDoneStatus })) || [];
          const updatedExercise = {
            ...exercise,
            done: newDoneStatus,
            sets: updatedSets,
          };
          store.dispatch("updateExerciseInPlan", updatedExercise);
        }
      }
    };

    const toggleSetDone = (exerciseId: string, setId: string) => {
      if (!isTrainingActive.value) return;
      const exercise = currentTraining.value.find((ex) => ex.id === exerciseId);
      if (exercise && exercise.category === "strength" && exercise.sets) {
        const set = exercise.sets.find((s) => s.id === setId);
        if (set) {
          const updatedSet = { ...set, done: !set.done };
          store.dispatch("updateSet", { exerciseId, updatedSet });

          if (updatedSet.done) {
            store.dispatch("startRestTimer", 60);
          }

          const allSetsDone = exercise.sets.every((s) => s.done);
          if (exercise.done !== allSetsDone) {
            store.dispatch("updateExerciseInPlan", {
              ...exercise,
              done: allSetsDone,
            });
          }
        }
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
    };

    const goToAddExercise = () => {
      router.push({ name: "add-exercise" });
    };

    const goToHistory = () => {
      router.push({ name: "history" });
    };

    const goToExerciseTypes = () => {
      router.push({ name: "exercise-types" });
    };

    const goToStats = () => {
      router.push({ name: "stats" });
    };

    const saveAsTemplate = () => {
      const name = prompt("Podaj nazwę dla szablonu:");
      if (name && name.trim() !== "") {
        store.dispatch("saveCurrentTrainingAsTemplate", name);
        toast.success(`Trening zapisany jako szablon "${name}"`);
      }
    };

    const goToTemplates = () => {
      router.push({ name: "templates" });
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
      startTraining,
      handleLogout,
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
      goToHistory,
      goToExerciseTypes,
      goToStats,
      saveAsTemplate,
      goToTemplates,
    };
  },
});
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 80vh;
  color: #555;
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
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: #2c3e50;
  color: white;
  padding: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.2em;
  z-index: 1000;
  gap: 20px;
}
.rest-timer-overlay button {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 5px 15px;
  border-radius: 5px;
  cursor: pointer;
}
.timer {
  font-size: 0.8em;
  font-weight: bold;
  color: #007bff;
  margin-left: 15px;
  background-color: #e3f2fd;
  padding: 5px 10px;
  border-radius: 5px;
}
.welcome-container {
  padding: 20px;
  text-align: center;
  max-width: 600px;
  margin: 20px auto;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
}
.logout-button {
  position: absolute;
  top: 20px;
  right: 20px;
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9em;
  transition: background-color 0.3s ease;
}
.logout-button:hover {
  background-color: #c82333;
}
h2 {
  color: #2c3e50;
  margin-bottom: 30px;
  padding-top: 20px;
  font-size: 2em;
}
hr {
  border: none;
  border-top: 1px solid #eee;
  margin: 40px 0;
}
.training-section {
  text-align: left;
  margin-bottom: 40px;
  background-color: #ffffff;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}
.training-section h3 {
  font-size: 1.8em;
  color: #42b983;
  margin-bottom: 20px;
  text-align: center;
}
.no-exercises {
  text-align: center;
  color: #777;
  font-style: italic;
  margin-bottom: 20px;
}
.exercise-list {
  list-style: none;
  padding: 0;
  margin-bottom: 30px;
}
.exercise-item {
  background-color: #e8f5e9;
  border: 1px solid #c8e6c9;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: background-color 0.3s ease, opacity 0.3s ease;
}
.exercise-item.active-training.exercise-done {
  background-color: #d4edda;
  border-color: #28a745;
}
.exercise-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  width: 100%;
  gap: 10px;
}
.exercise-name {
  font-weight: bold;
  color: #2c3e50;
  font-size: 1.1em;
  flex-grow: 1;
  text-align: left;
}
.exercise-item input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #42b983;
  flex-shrink: 0;
}
.exercise-item input:disabled {
  cursor: not-allowed;
}
.remove-button {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.8em;
  flex-shrink: 0;
}
.remove-button:hover {
  background-color: #c82333;
}
.remove-button:disabled {
  background-color: #a0a0a0;
  cursor: not-allowed;
}
.exercise-content {
  width: 100%;
}
.set-list {
  list-style: none;
  padding: 0;
  margin-top: 10px;
}
.set-item {
  background-color: #f0f8ff;
  border: 1px solid #cce5ff;
  border-radius: 6px;
  padding: 10px;
  margin-bottom: 8px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.set-item.set-done {
  background-color: #d1ecf1;
  border-color: #007bff;
}
.set-item label {
  display: flex;
  flex-direction: column;
  font-size: 0.8em;
  color: #555;
  flex: 1 1 80px;
}
.set-item input[type="number"] {
  width: 100%;
  padding: 5px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-top: 3px;
  font-size: 0.9em;
}
.set-item input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #007bff;
}
.remove-set-button {
  background-color: #ffc107;
  color: black;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.8em;
  margin-left: auto;
}
.remove-set-button:hover {
  background-color: #e0a800;
}
.add-set-button {
  background-color: #17a2b8;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9em;
  margin-top: 15px;
  width: 100%;
  transition: background-color 0.3s ease;
}
.add-set-button:hover:not(:disabled) {
  background-color: #138496;
}
.add-set-button:disabled {
  background-color: #a0a0a0;
  cursor: not-allowed;
}
.training-actions {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
}
.action-button {
  flex: 1 1 45%;
  max-width: 250px;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 1em;
  cursor: pointer;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.action-button:disabled {
  background-color: #a0a0a0;
  cursor: not-allowed;
}
.action-button.primary {
  background-color: #42b983;
  color: white;
}
.action-button.primary:hover:not(:disabled) {
  background-color: #368a65;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}
.action-button.secondary {
  background-color: #007bff;
  color: white;
}
.action-button.secondary:hover {
  background-color: #0056b3;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}
.navigation-section {
  text-align: center;
  background-color: #ffffff;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}
.navigation-section h3 {
  font-size: 1.8em;
  color: #2c3e50;
  margin-bottom: 20px;
}
.nav-buttons {
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-width: 300px;
  margin: 0 auto;
}
.nav-button {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 1em;
  cursor: pointer;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.nav-button:hover {
  background-color: #5a6268;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}
.error-message {
  color: #dc3545;
  margin-top: 10px;
  font-size: 0.9em;
}
</style>
