<template>
  <div class="view-container">
    <h1>Podsumowanie Treningu</h1>
    <div v-if="training" class="summary-section">
      <div class="summary-header">
        <h3>Trening z dnia: {{ training.date }}</h3>
        <p>Czas trwania: {{ training.duration }}</p>
      </div>
      <ul class="exercise-list">
        <li
          v-for="exercise in training.exercises"
          :key="exercise.id"
          class="exercise-item"
        >
          <strong>{{ exercise.name }}</strong>
          <ul v-if="exercise.sets && exercise.sets.length" class="set-list">
            <li v-for="(set, index) in exercise.sets" :key="set.id">
              Seria {{ index + 1 }}: {{ set.weight || 0 }}kg x
              {{ set.reps || 0 }} powt.
            </li>
          </ul>
          <p v-else-if="exercise.duration">
            Czas trwania: {{ exercise.duration }} min.
          </p>
        </li>
      </ul>
    </div>
    <div v-else class="info-message">
      <p>Nie znaleziono treningu. Być może został usunięty.</p>
    </div>
    <button @click="goToHistory" class="action-button">Wróć do historii</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import { TrainingRecord } from "@/store";

export default defineComponent({
  name: "TrainingSummaryView",
  setup() {
    const store = useStore();
    const route = useRoute();
    const router = useRouter();
    const trainingId = route.params.id as string;

    const training = computed<TrainingRecord | undefined>(() =>
      store.getters.allTrainingHistory.find(
        (t: TrainingRecord) => t.id === trainingId
      )
    );

    const goToHistory = () => {
      router.push({ name: "history" });
    };

    return {
      training,
      goToHistory,
    };
  },
});
</script>

<style scoped>
.view-container {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}
h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 20px;
}
.summary-section {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}
.summary-header {
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
  margin-bottom: 15px;
}
.summary-header h3 {
  margin: 0 0 5px 0;
  color: #42b983;
}
.summary-header p {
  margin: 0;
  color: #666;
}
.exercise-list {
  list-style: none;
  padding: 0;
}
.exercise-item {
  margin-bottom: 15px;
}
.set-list {
  list-style: none;
  padding-left: 15px;
  margin-top: 5px;
  font-size: 0.9em;
  color: #555;
}
.action-button {
  width: 100%;
  padding: 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1.1em;
}
.info-message {
  text-align: center;
  padding: 20px;
}
</style>
