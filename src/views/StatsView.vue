<template>
  <div class="view-container">
    <h1>Twoje Statystyki Treningowe</h1>

    <div class="stats-section">
      <p v-if="allTrainingHistory.length === 0" class="info-message">
        Brak danych do wyświetlenia. Zakończ kilka treningów, aby zobaczyć
        statystyki.
      </p>

      <div v-else>
        <div class="stat-block">
          <h3>Podsumowanie</h3>
          <p>
            Liczba zakończonych treningów:
            <strong>{{ stats.totalTrainings }}</strong>
          </p>
          <p>
            Łączna liczba wykonanych serii (siłowe):
            <strong>{{ stats.totalCompletedSets }}</strong>
          </p>
          <p>
            Łączny czas ćwiczeń (kardio):
            <strong>{{ stats.totalCardioDuration }} min</strong>
          </p>
        </div>

        <div class="chart-container">
          <h3>Liczba treningów w czasie</h3>
          <Bar :data="chartData.trainingsPerMonth" :options="chartOptions" />
        </div>

        <div class="chart-container">
          <h3>Objętość treningowa (siłowe)</h3>
          <Line :data="chartData.strengthVolume" :options="chartOptions" />
        </div>

        <div class="chart-container">
          <h3>Najwyższe ciężary (PR)</h3>
          <Bar :data="chartData.prWeights" :options="chartOptions" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { TrainingRecord, PlannedExercise } from "@/store";
import { Bar, Line } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from "chart.js";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
);

export default defineComponent({
  name: "StatsView",
  components: {
    Bar,
    Line,
  },
  setup() {
    const store = useStore();

    const allTrainingHistory = computed<TrainingRecord[]>(
      () => store.getters.allTrainingHistory
    );

    const stats = computed(() => {
      let totalTrainings = allTrainingHistory.value.length;
      let totalCompletedSets = 0;
      let totalCardioDuration = 0;
      let totalFlexibilityDuration = 0;
      let totalRecoveryDuration = 0;

      allTrainingHistory.value.forEach((training) => {
        training.exercises.forEach((exercise) => {
          if (exercise.category === "strength" && exercise.sets) {
            exercise.sets.forEach((set) => {
              if (set.done) {
                totalCompletedSets++;
              }
            });
          } else if (exercise.category === "cardio" && exercise.done) {
            totalCardioDuration += exercise.duration || 0;
          } else if (exercise.category === "flexibility" && exercise.done) {
            totalFlexibilityDuration += exercise.duration || 0;
          } else if (exercise.category === "recovery" && exercise.done) {
            totalRecoveryDuration += exercise.duration || 0;
          }
        });
      });

      return {
        totalTrainings,
        totalCompletedSets,
        totalCardioDuration,
        totalFlexibilityDuration,
        totalRecoveryDuration,
      };
    });

    const chartData = computed(() => {
      const dates = allTrainingHistory.value.map((t) => t.date);
      const uniqueDates = [...new Set(dates)].sort();

      const trainingsPerMonthData = uniqueDates.map((date) => {
        return allTrainingHistory.value.filter((t) => t.date === date).length;
      });

      const strengthVolumeData = uniqueDates.map((date) => {
        const trainings = allTrainingHistory.value.filter(
          (t) => t.date === date
        );
        let totalVolume = 0;
        trainings.forEach((training) => {
          training.exercises.forEach((exercise) => {
            if (exercise.category === "strength" && exercise.sets) {
              exercise.sets.forEach((set) => {
                if (set.done) {
                  totalVolume += (set.weight || 0) * (set.reps || 0);
                }
              });
            }
          });
        });
        return totalVolume;
      });

      const prWeightsData: { [key: string]: number } = {};
      allTrainingHistory.value.forEach((training) => {
        training.exercises.forEach((exercise) => {
          if (exercise.category === "strength" && exercise.sets) {
            exercise.sets.forEach((set) => {
              const exerciseName = exercise.name;
              const weight = set.weight || 0;
              if (
                !prWeightsData[exerciseName] ||
                prWeightsData[exerciseName] < weight
              ) {
                prWeightsData[exerciseName] = weight;
              }
            });
          }
        });
      });

      return {
        trainingsPerMonth: {
          labels: uniqueDates,
          datasets: [
            {
              label: "Liczba treningów",
              backgroundColor: "#42b983",
              data: trainingsPerMonthData,
            },
          ],
        },
        strengthVolume: {
          labels: uniqueDates,
          datasets: [
            {
              label: "Objętość siłowa (kg)",
              backgroundColor: "#007bff",
              data: strengthVolumeData,
            },
          ],
        },
        prWeights: {
          labels: Object.keys(prWeightsData),
          datasets: [
            {
              label: "Najwyższy ciężar (kg)",
              backgroundColor: "#17a2b8",
              data: Object.values(prWeightsData),
            },
          ],
        },
      };
    });

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
    };

    return {
      stats,
      allTrainingHistory,
      chartData,
      chartOptions,
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
}
h1 {
  color: #2c3e50;
  margin-bottom: 30px;
  font-size: 2em;
}
.stats-section {
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
  margin-bottom: 20px;
}
.stat-block {
  margin-bottom: 30px;
}
.stat-block h3 {
  color: #42b983;
  border-bottom: 2px solid #42b983;
  padding-bottom: 5px;
  margin-bottom: 15px;
}
.chart-container {
  margin-bottom: 30px;
  max-height: 400px;
}
.chart-container h3 {
  color: #42b983;
  border-bottom: 2px solid #42b983;
  padding-bottom: 5px;
  margin-bottom: 15px;
}
</style>
