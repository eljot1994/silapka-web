// src/composables/useTrainingTimer.ts
import { computed } from "vue";
import { useStore } from "vuex";

export function useTrainingTimer() {
  const store = useStore();

  // Udostępnia stan timera z Vuex jako właściwości computed
  const isTrainingActive = computed(() => store.getters.isTrainingActive);
  const isTrainingPaused = computed(() => store.getters.isTrainingPaused);
  const trainingTime = computed(() => store.getters.trainingTime);

  // Udostępnia akcje do sterowania timerem
  const startTraining = () => store.dispatch("startTraining");
  const pauseTraining = () => store.dispatch("pauseTraining");
  const resumeTraining = () => store.dispatch("resumeTraining");

  // Zwraca wszystkie potrzebne elementy, aby komponent mógł z nich korzystać
  return {
    isTrainingActive,
    isTrainingPaused,
    trainingTime,
    startTraining,
    pauseTraining,
    resumeTraining,
  };
}
