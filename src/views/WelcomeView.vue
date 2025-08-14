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
      <button @click="handleLogout" class="logout-button" title="Wyloguj">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24px"
          viewBox="0 0 24 24"
          width="24px"
          fill="#FFFFFF"
        >
          <path d="M0 0h24v24H0z" fill="none" />
          <path
            d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"
          />
        </svg>
      </button>
    </div>

    <div class="training-section">
      <h3>
        Aktualny Trening
        <span v-if="isTrainingActive" class="timer">{{ trainingTime }}</span>
      </h3>

      <div
        v-if="!isTrainingActive && currentTraining.length > 0"
        class="start-training-banner"
      >
        <p>Masz zaplanowany trening. Gotowy, aby zacząć?</p>
        <button @click="startTraining" class="action-button primary large">
          Rozpocznij Trening
        </button>
      </div>

      <div v-if="currentTraining.length === 0" class="no-exercises">
        <p>Brak zaplanowanych ćwiczeń.</p>
        <button @click="goToAddExercise" class="action-button">
          + Dodaj pierwsze ćwiczenie
        </button>
      </div>

      <ul v-else class="exercise-list">
        <li
          v-for="exercise in currentTraining"
          :key="exercise.id"
          class="exercise-card"
          :class="{
            'exercise-done': exercise.done,
            'active-training': isTrainingActive,
          }"
        >
          <div class="card-header">
            <span class="exercise-name">{{ exercise.name }}</span>
            <div class="header-actions">
              <input
                type="checkbox"
                class="exercise-checkbox"
                title="Oznacz całe ćwiczenie jako wykonane"
                :checked="exercise.done"
                :disabled="!isTrainingActive"
                @change="toggleExerciseDone(exercise.id)"
              />
              <button
                @click="removeExercise(exercise.id)"
                class="icon-button"
                title="Usuń ćwiczenie z planu"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24px"
                  viewBox="0 0 24 24"
                  width="24px"
                  fill="#5f6368"
                >
                  <path d="M0 0h24v24H0z" fill="none" />
                  <path
                    d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div class="card-content">
            <template v-if="exercise.category === 'strength'">
              <ul class="set-list">
                <li class="set-header-row">
                  <span class="set-col">Seria</span>
                  <span class="set-col">Ciężar (kg)</span>
                  <span class="set-col">Powt.</span>
                  <span class="set-col">Stan</span>
                </li>
                <li
                  v-for="(set, index) in exercise.sets"
                  :key="set.id"
                  class="set-item"
                  :class="{ 'set-done': set.done }"
                >
                  <span class="set-col set-index">{{ index + 1 }}</span>
                  <input
                    class="set-col"
                    type="number"
                    v-model.number="set.weight"
                    @input="updateSetInStore(exercise.id, set)"
                  />
                  <input
                    class="set-col"
                    type="number"
                    v-model.number="set.reps"
                    @input="updateSetInStore(exercise.id, set)"
                  />
                  <div class="set-col set-actions">
                    <input
                      type="checkbox"
                      class="set-checkbox"
                      title="Oznacz serię jako wykonaną"
                      :checked="set.done"
                      :disabled="!isTrainingActive"
                      @change="toggleSetDone(exercise.id, set.id)"
                    />
                    <button
                      @click="removeSet(exercise.id, set.id)"
                      class="icon-button small"
                      title="Usuń serię"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="20px"
                        viewBox="0 0 24 24"
                        width="20px"
                        fill="#5f6368"
                      >
                        <path d="M0 0h24v24H0z" fill="none" />
                        <path
                          d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                        />
                      </svg>
                    </button>
                  </div>
                </li>
              </ul>
              <button @click="addSet(exercise.id)" class="add-set-button">
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
                Dodaj serię
              </button>
            </template>

            <template v-else>
              <div class="other-exercise-inputs">
                <label v-if="exercise.duration !== undefined">
                  Długość (min):
                  <input
                    type="number"
                    v-model.number="exercise.duration"
                    @input="updateExerciseInStore(exercise)"
                  />
                </label>
                <label v-if="exercise.reps !== undefined">
                  Powtórzenia:
                  <input
                    type="number"
                    v-model.number="exercise.reps"
                    @input="updateExerciseInStore(exercise)"
                  />
                </label>
              </div>
            </template>
          </div>
        </li>
      </ul>
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
        @click="finishTraining"
        v-if="isTrainingActive"
        class="action-button secondary"
      >
        Zakończ trening
      </button>
    </div>

    <nav class="bottom-nav">
      <button @click="goToHistory" class="nav-button" title="Historia">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24px"
          viewBox="0 0 24 24"
          width="24px"
          fill="currentColor"
        >
          <path d="M0 0h24v24H0z" fill="none" />
          <path
            d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"
          />
        </svg>
        <span>Historia</span>
      </button>
      <button
        @click="goToExerciseTypes"
        class="nav-button"
        title="Typy ćwiczeń"
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
            d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z"
          />
        </svg>
        <span>Ćwiczenia</span>
      </button>
      <button @click="goToTemplates" class="nav-button" title="Szablony">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24px"
          viewBox="0 0 24 24"
          width="24px"
          fill="currentColor"
        >
          <path d="M0 0h24v24H0z" fill="none" />
          <path
            d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V6h5.17l2 2H20v10z"
          />
        </svg>
        <span>Szablony</span>
      </button>
      <button @click="goToStats" class="nav-button" title="Statystyki">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24px"
          viewBox="0 0 24 24"
          width="24px"
          fill="currentColor"
        >
          <path d="M0 0h24v24H0z" fill="none" />
          <path
            d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"
          />
        </svg>
        <span>Statystyki</span>
      </button>
    </nav>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, onMounted, onUnmounted } from "vue";
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

    // Funkcja do aktualizacji wyświetlanego czasu treningu
    const updateTrainingTime = () => {
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
      } else {
        trainingTime.value = "00:00:00"; // Reset jeśli czas startu jest null
      }
    };

    const startTraining = () => {
      // Jeśli trening już jest aktywny, nie rób nic
      if (store.getters.isTrainingActive) {
        return;
      }
      store.commit("SET_TRAINING_ACTIVE", true);
      // Uruchomienie interwału i jego przechowywanie
      timerInterval = window.setInterval(updateTrainingTime, 1000);
    };

    // Po zamontowaniu komponentu, sprawdź, czy trening jest aktywny i uruchom timer
    onMounted(() => {
      if (store.getters.isTrainingActive && !timerInterval) {
        timerInterval = window.setInterval(updateTrainingTime, 1000);
      }
      // Natychmiastowa aktualizacja czasu po wejściu do widoku
      updateTrainingTime();
    });

    onUnmounted(() => {
      // Czyść interwał tylko jeśli trening NIE JEST aktywny
      // Jeśli trening jest aktywny, pozwól mu działać w tle
      if (!store.getters.isTrainingActive && timerInterval) {
        clearInterval(timerInterval);
        timerInterval = undefined;
      }
      // Stop rest timer zawsze, bo to jest powiązane z widokiem
      store.dispatch("stopRestTimer");
    });

    const handleLogout = () => {
      // Upewnij się, że timer jest zatrzymany przy wylogowaniu
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = undefined;
      }
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
        // Upewnij się, że timer jest zatrzymany po zakończeniu treningu
        if (timerInterval) {
          clearInterval(timerInterval);
          timerInterval = undefined;
        }
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
/* GENERAL */
.page-wrapper {
  padding: 20px 20px 100px 20px; /* Dodatkowy padding na dole dla nawigacji */
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
.logout-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}
.logout-button svg {
  fill: #5f6368;
}
.logout-button:hover {
  background-color: #f1f3f4;
}

/* TRAINING SECTION */
.training-section h3 {
  font-size: 1.5em;
  color: #2c3e50;
  text-align: center;
  margin-bottom: 20px;
}
.timer {
  font-size: 0.8em;
  font-weight: bold;
  color: #007bff;
  margin-left: 10px;
  background-color: #e3f2fd;
  padding: 5px 10px;
  border-radius: 5px;
}

/* START BANNER */
.start-training-banner {
  background-color: #e8f5e9;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  margin-bottom: 20px;
}
.start-training-banner p {
  margin: 0 0 15px 0;
  color: #333;
}

/* EXERCISE LIST */
.exercise-list {
  list-style: none;
  padding: 0;
}
.exercise-card {
  background-color: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  margin-bottom: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}
.exercise-done {
  border-left: 4px solid #42b983;
}

/* CARD HEADER */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: #f9f9f9;
  border-bottom: 1px solid #e0e0e0;
}
.exercise-name {
  font-weight: bold;
  font-size: 1.1em;
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}
.exercise-checkbox {
  width: 22px;
  height: 22px;
  accent-color: #42b983;
}

/* CARD CONTENT & SETS */
.card-content {
  padding: 15px;
}
.set-list {
  list-style: none;
  padding: 0;
  display: grid;
  gap: 10px;
}
.set-header-row,
.set-item {
  display: grid;
  grid-template-columns: 0.5fr 1fr 1fr 1fr;
  gap: 10px;
  align-items: center;
  text-align: center;
}
.set-header-row {
  font-weight: bold;
  font-size: 0.8em;
  color: #666;
  padding-bottom: 5px;
  border-bottom: 1px solid #eee;
}
.set-col input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 6px;
  text-align: center;
}
.set-index {
  font-weight: bold;
}
.set-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.set-checkbox {
  width: 20px;
  height: 20px;
  accent-color: #007bff;
}
.set-done {
  opacity: 0.6;
}
.set-done .set-col input {
  background-color: #f1f3f4;
}

.add-set-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  margin-top: 15px;
  padding: 10px;
  font-size: 0.9em;
  background-color: #e8eaf6;
  color: #3f51b5;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
}

/* OTHER EXERCISES */
.other-exercise-inputs {
  display: flex;
  gap: 15px;
}
.other-exercise-inputs label {
  display: flex;
  flex-direction: column;
  width: 100%;
  font-size: 0.9em;
  color: #555;
}
.other-exercise-inputs input {
  margin-top: 5px;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 6px;
}

/* ACTION BUTTONS */
.main-actions-bar {
  display: flex;
  gap: 15px;
  margin-top: 30px;
}
.action-button {
  flex: 1;
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
}
.action-button.primary {
  background-color: #42b983;
  color: white;
}
.action-button.primary:hover {
  background-color: #368a65;
}
.action-button.secondary {
  background-color: #007bff;
  color: white;
}
.action-button.large {
  padding: 15px 25px;
  font-size: 1.1em;
}

/* BOTTOM NAVIGATION */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  background-color: #fff;
  box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
  padding: 10px 0;
}
.nav-button {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #5f6368;
  font-size: 0.75em;
  gap: 4px;
}
.nav-button svg {
  fill: #5f6368;
}

/* HELPERS & GENERIC */
.icon-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.icon-button:hover {
  background-color: #e0e0e0;
}
.icon-button.small svg {
  width: 20px;
  height: 20px;
}
.no-exercises {
  text-align: center;
  padding: 40px 20px;
  background-color: #f9f9f9;
  border-radius: 12px;
}
.no-exercises p {
  margin: 0 0 15px 0;
}

/* SPINNER & LOADING */
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
  bottom: 80px; /* Wyżej, żeby nie nachodziło na nawigację */
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
  z-index: 1000;
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
