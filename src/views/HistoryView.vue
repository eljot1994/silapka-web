<template>
  <div class="page-container">
    <h1>Historia Treningów</h1>
    <button @click="goBack" class="back-button">Wróć</button>

    <div class="history-section">
      <p v-if="trainingHistory.length === 0" class="info-message">
        Brak zapisanych treningów w historii.
      </p>

      <ul v-else class="training-list">
        <li
          v-for="training in trainingHistory"
          :key="training.id"
          class="training-item"
        >
          <div class="training-header">
            <h4>
              Trening z dnia:
              <span class="training-date">{{ training.date }}</span>
            </h4>
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
                v-if="exercise.category === 'strength'"
                class="exercise-details-summary"
              >
                <span v-for="(set, index) in exercise.sets" :key="set.id">
                  {{ index + 1 }}. {{ set.weight }}kg x {{ set.reps }} powt.
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

    const trainingHistory = computed<TrainingRecord[]>(
      () => store.getters.allTrainingHistory
    );

    const goBack = () => {
      router.back();
    };

    const getCategoryName = (category: string) => {
      switch (category) {
        case "strength":
          return "Siłowe";
        case "cardio":
          return "Cardio";
        case "flexibility":
          return "Mobilność i Elastyczność";
        case "recovery":
          return "Odnowa i Regeneracja";
        default:
          return category;
      }
    };

    return {
      trainingHistory,
      goBack,
      getCategoryName,
    };
  },
});
</script>

<style scoped>
.page-container {
  padding: 20px;
  text-align: center;
  max-width: 600px;
  margin: 20px auto;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
}

.back-button {
  position: absolute;
  top: 20px;
  left: 20px;
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9em;
  transition: background-color 0.3s ease;
}

.back-button:hover {
  background-color: #5a6268;
}

h1 {
  color: #2c3e50;
  margin-bottom: 30px;
  padding-top: 20px;
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

.training-header {
  margin-bottom: 10px;
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
