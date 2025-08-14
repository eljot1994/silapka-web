<template>
  <div class="view-container">
    <button @click="goBackToProfile" class="back-button">
      &larr; Wróć do profilu
    </button>
    <h1>Historia Treningów</h1>

    <div class="history-section">
      <p v-if="sortedTrainingHistory.length === 0" class="info-message">
        Brak zapisanych treningów w historii.
      </p>

      <ul v-else class="training-list">
        <li
          v-for="training in sortedTrainingHistory"
          :key="training.id"
          class="training-item"
        >
          <div class="training-header">
            <h4>
              Trening z dnia:
              <span class="training-date">{{ training.date }}</span>
              <br />
              <small class="training-duration"
                >Czas trwania: {{ training.duration || "N/A" }}</small
              >
            </h4>
            <button @click="deleteTraining(training.id)" class="delete-button">
              Usuń
            </button>
          </div>
          <p class="exercises-summary">
            Wykonane ćwiczenia ({{ training.exercises.length }}):
          </p>
          <ul class="exercise-summary-list">
            <li
              v-for="exercise in training.exercises"
              :key="exercise.id"
              class="exercise-summary-item"
            >
              <span class="exercise-name-summary">{{ exercise.name }}</span>
              <span
                v-if="exercise.category === 'strength' && exercise.sets"
                class="exercise-details-summary"
              >
                <span v-for="(set, index) in exercise.sets" :key="set.id">
                  {{ index + 1 }}. {{ set.weight || 0 }}kg x
                  {{ set.reps || 0 }} powt.
                  {{ set.done ? "(wyk.)" : "(niewyk.)" }}<br />
                </span>
              </span>
              <span
                v-else-if="exercise.category === 'cardio'"
                class="exercise-details-summary"
              >
                {{ exercise.duration }} min.
                {{ exercise.done ? "(wyk.)" : "(niewyk.)" }}
              </span>
              <span
                v-else-if="exercise.category === 'flexibility'"
                class="exercise-details-summary"
              >
                <span v-if="exercise.reps"
                  >Powtórzenia: {{ exercise.reps }}</span
                >
                <span v-if="exercise.duration"
                  >Długość: {{ exercise.duration }} min.</span
                >
                {{ exercise.done ? "(wyk.)" : "(niewyk.)" }}
              </span>
              <span
                v-else-if="exercise.category === 'recovery'"
                class="exercise-details-summary"
              >
                {{ exercise.duration }} min.
                {{ exercise.done ? "(wyk.)" : "(niewyk.)" }}
              </span>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { TrainingRecord } from "@/store";

export default defineComponent({
  name: "HistoryView",
  setup() {
    const store = useStore();
    const router = useRouter();

    const goBackToProfile = () => router.push({ name: "profile" });

    const parseDate = (dateString: string) => {
      const parts = dateString.split(".");
      return new Date(
        parseInt(parts[2], 10),
        parseInt(parts[1], 10) - 1,
        parseInt(parts[0], 10)
      );
    };

    const sortedTrainingHistory = computed<TrainingRecord[]>(() => {
      return [...store.getters.allTrainingHistory].sort((a, b) => {
        const dateA = parseDate(a.date);
        const dateB = parseDate(b.date);
        return dateB.getTime() - dateA.getTime();
      });
    });

    const deleteTraining = (trainingId: string) => {
      if (confirm("Czy na pewno chcesz usunąć ten trening z historii?")) {
        store.dispatch("deleteTrainingFromHistory", trainingId);
      }
    };

    return {
      sortedTrainingHistory,
      deleteTraining,
      goBackToProfile,
    };
  },
});
</script>

<style scoped>
.view-container {
  padding: 20px;
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
  position: relative;
}
.back-button {
  position: absolute;
  top: 20px;
  left: 20px;
  background: none;
  border: none;
  font-weight: bold;
  cursor: pointer;
  color: #007bff;
}
.training-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.delete-button {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
}
.training-duration {
  font-size: 0.7em;
  color: #555;
  font-weight: normal;
}
h1 {
  color: #2c3e50;
  margin-bottom: 30px;
  font-size: 2em;
}
.history-section {
  background-color: #ffffff;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  text-align: left;
}
.info-message {
  text-align: center;
  color: #777;
  font-style: italic;
}
.training-list {
  list-style: none;
  padding: 0;
}
.training-item {
  background-color: #e8f5e9;
  border: 1px solid #c8e6c9;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
.training-header h4 {
  margin: 0;
  font-size: 1.5em;
  color: #42b983;
}
.training-date {
  font-weight: normal;
  color: #2c3e50;
  font-size: 0.9em;
  background-color: #f0f0f0;
  padding: 4px 8px;
  border-radius: 4px;
}
.exercises-summary {
  font-weight: bold;
  margin-top: 15px;
  margin-bottom: 10px;
}
.exercise-summary-list {
  list-style: none;
  padding-left: 0;
  border-left: 2px solid #ccc;
  margin-left: 10px;
}
.exercise-summary-item {
  margin-bottom: 10px;
  padding-left: 10px;
}
.exercise-name-summary {
  font-weight: bold;
  color: #2c3e50;
  font-size: 1em;
}
.exercise-details-summary {
  font-size: 0.9em;
  color: #555;
  display: block;
  margin-top: 5px;
  padding-left: 10px;
}
</style>
