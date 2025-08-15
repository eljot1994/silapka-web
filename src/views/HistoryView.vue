<template>
  <TrainingListView
    title="Historia Treningów"
    :items="sortedTrainingHistory"
    empty-message="Brak zapisanych treningów w historii."
  >
    <template #item-header="{ item }">
      <h4 class="history-title">
        Trening z dnia:
        <span class="training-date">{{ item.date }}</span>
        <br />
        <small class="training-duration">
          Czas trwania: {{ item.duration || "N/A" }}
        </small>
      </h4>
      <button @click="deleteTraining(item.id)" class="delete-button">
        Usuń
      </button>
    </template>

    <template #exercise-list="{ item }">
      <li
        v-for="exercise in item.exercises"
        :key="exercise.id"
        class="exercise-summary-item"
      >
        <span class="exercise-name-summary">{{ exercise.name }}</span>
        <span
          v-if="exercise.category === 'strength' && exercise.sets"
          class="exercise-details-summary"
        >
          <span v-for="(set, index) in exercise.sets" :key="set.id">
            {{ index + 1 }}. {{ set.weight || 0 }}kg x {{ set.reps || 0 }} powt.
            {{ set.done ? "(wyk.)" : "(niewyk.)" }}<br />
          </span>
        </span>
        <span v-else class="exercise-details-summary">
          <span v-if="exercise.duration">{{ exercise.duration }} min. </span>
          <span v-if="exercise.reps">Powtórzenia: {{ exercise.reps }}. </span>
          {{ exercise.done ? "(wyk.)" : "(niewyk.)" }}
        </span>
      </li>
    </template>
  </TrainingListView>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { useStore } from "vuex";
import { TrainingRecord } from "@/store";
import { parseDate } from "@/utils/date";
import TrainingListView from "@/components/TrainingListView.vue";

export default defineComponent({
  name: "HistoryView",
  components: {
    TrainingListView,
  },
  setup() {
    const store = useStore();

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
    };
  },
});
</script>

<style scoped>
/* Używamy :deep() aby styl dotarł do komponentu potomnego */
:deep(.list-item) {
  background-color: #e8f5e9; /* Zielone tło */
  border-color: #c8e6c9;
}

.history-title {
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
.training-duration {
  font-size: 0.7em;
  color: #555;
  font-weight: normal;
}
.delete-button {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
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
