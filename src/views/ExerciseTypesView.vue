<template>
  <div class="page-container">
    <h1>Typy Ćwiczeń</h1>
    <button @click="goBack" class="back-button">Wróć</button>

    <div class="exercise-types-section">
      <h3>Dodaj nowy typ ćwiczenia</h3>
      <form @submit.prevent="handleFormSubmit" class="add-form">
        <div class="form-group">
          <label for="name">Nazwa:</label>
          <input type="text" id="name" v-model="newExercise.name" required />
        </div>
        <div class="form-group">
          <label for="category">Kategoria:</label>
          <select id="category" v-model="newExercise.category" required>
            <option value="" disabled>Wybierz kategorię</option>
            <option value="strength">Siłowe</option>
            <option value="cardio">Cardio</option>
            <option value="flexibility">Mobilność i Elastyczność</option>
            <option value="recovery">Odnowa i Regeneracja</option>
          </select>
        </div>
        <div class="form-group">
          <label for="description">Opis:</label>
          <textarea
            id="description"
            v-model="newExercise.description"
            required
          ></textarea>
        </div>
        <div class="form-group">
          <label for="imageUrl">URL zdjęcia (opcjonalnie):</label>
          <input type="text" id="imageUrl" v-model="newExercise.imageUrl" />
        </div>
        <button type="submit" class="submit-button">Dodaj typ</button>
      </form>

      <h3>Dostępne typy ćwiczeń</h3>
      <ul class="exercise-list">
        <li
          v-for="type in allExerciseTypes"
          :key="type.id"
          class="exercise-item"
        >
          <div class="exercise-content">
            <img
              v-if="type.imageUrl"
              :src="type.imageUrl"
              alt="Zdjęcie ćwiczenia"
              class="exercise-image"
            />
            <div class="exercise-text">
              <span class="exercise-name">{{ type.name }}</span>
              <span class="exercise-category"
                >({{ getCategoryName(type.category) }})</span
              >
              <p class="exercise-description">{{ type.description }}</p>

              <div class="exercise-stats">
                <p><strong>Statystyki:</strong></p>
                <ul>
                  <li>
                    Użyto w treningu: {{ getStats(type.id).usageCount }} razy
                  </li>
                  <li v-if="getStats(type.id).category === 'strength'">
                    Najwyższy ciężar:
                    {{ getStats(type.id).maxWeight || "-" }} kg
                  </li>
                  <li v-if="getStats(type.id).category === 'strength'">
                    Średnia waga: {{ getStats(type.id).avgWeight || "-" }} kg
                  </li>
                  <li
                    v-if="
                      getStats(type.id).category === 'strength' ||
                      getStats(type.id).category === 'flexibility'
                    "
                  >
                    Średnia powtórzeń: {{ getStats(type.id).avgReps || "-" }}
                  </li>
                  <li v-if="getStats(type.id).category === 'strength'">
                    Łącznie serii: {{ getStats(type.id).totalSets || "-" }}
                  </li>
                  <li
                    v-if="
                      getStats(type.id).category === 'cardio' ||
                      getStats(type.id).category === 'flexibility' ||
                      getStats(type.id).category === 'recovery'
                    "
                  >
                    Łączny czas:
                    {{ getStats(type.id).totalDuration || "-" }} min.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { ExerciseType, TrainingRecord, PlannedExercise } from "@/store";

export default defineComponent({
  name: "ExerciseTypesView",
  setup() {
    const store = useStore();
    const router = useRouter();

    const newExercise = ref<Omit<ExerciseType, "id">>({
      name: "",
      category: "" as "cardio" | "strength" | "flexibility" | "recovery",
      description: "",
      imageUrl: "",
    });

    const allExerciseTypes = computed<ExerciseType[]>(
      () => store.getters.allExerciseTypes
    );
    const trainingHistory = computed<TrainingRecord[]>(
      () => store.getters.allTrainingHistory
    );

    const handleFormSubmit = () => {
      store.dispatch("addExerciseType", newExercise.value);
      newExercise.value = {
        name: "",
        category: "" as "cardio" | "strength" | "flexibility" | "recovery",
        description: "",
        imageUrl: "",
      };
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

    const goBack = () => {
      router.back();
    };

    // NOWA FUNKCJA DO OBLICZANIA STATYSTYK
    const getStats = (typeId: string) => {
      const exerciseType = allExerciseTypes.value.find(
        (type) => type.id === typeId
      );
      if (!exerciseType) {
        return { usageCount: 0 };
      }

      const stats = {
        usageCount: 0,
        totalSets: 0,
        totalReps: 0,
        totalWeight: 0,
        maxWeight: 0,
        totalDuration: 0,
        avgReps: 0,
        avgWeight: 0,
        category: exerciseType.category,
      };

      // Przechodzimy przez całą historię treningów
      trainingHistory.value.forEach((training) => {
        training.exercises.forEach((exercise) => {
          // Liczymy wystąpienia danego typu ćwiczenia
          if (exercise.exerciseTypeId === typeId) {
            stats.usageCount++;

            // Obliczamy statystyki w zależności od kategorii
            if (exercise.category === "strength" && exercise.sets) {
              stats.totalSets += exercise.sets.length;
              exercise.sets.forEach((set) => {
                if (set.done) {
                  stats.totalReps += set.reps || 0;
                  stats.totalWeight += (set.weight || 0) * (set.reps || 0);
                  if (set.weight && set.weight > stats.maxWeight) {
                    stats.maxWeight = set.weight;
                  }
                }
              });
            } else if (exercise.category === "cardio" && exercise.done) {
              stats.totalDuration += exercise.duration || 0;
            } else if (exercise.category === "flexibility" && exercise.done) {
              stats.totalReps += exercise.reps || 0;
              stats.totalDuration += exercise.duration || 0;
            } else if (exercise.category === "recovery" && exercise.done) {
              stats.totalDuration += exercise.duration || 0;
            }
          }
        });
      });

      // Obliczanie wartości średnich (unikamy dzielenia przez zero)
      if (stats.totalSets > 0) {
        stats.avgReps = stats.totalReps / stats.totalSets;
      }
      if (stats.totalWeight > 0) {
        // Obliczenie średniej wagi może być bardziej złożone, zależy od tego, jak chcemy liczyć.
        // Na razie prosta średnia w oparciu o wagę*reps
        const totalVolume = stats.totalWeight;
        const totalReps = stats.totalReps;
        if (totalReps > 0) {
          stats.avgWeight = totalVolume / totalReps;
        }
      }

      return stats;
    };

    return {
      newExercise,
      allExerciseTypes,
      trainingHistory,
      handleFormSubmit,
      getCategoryName,
      goBack,
      getStats,
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

.exercise-types-section {
  background-color: #ffffff;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  text-align: left;
}

h3 {
  color: #42b983;
  border-bottom: 2px solid #42b983;
  padding-bottom: 5px;
  margin-bottom: 20px;
}

.add-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 30px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

label {
  font-weight: bold;
  margin-bottom: 5px;
  color: #555;
}

input,
select,
textarea {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1em;
  width: 100%;
  box-sizing: border-box;
}

.submit-button {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1.1em;
  transition: background-color 0.3s ease;
}

.submit-button:hover {
  background-color: #368a68;
}

.exercise-list {
  list-style: none;
  padding: 0;
}

.exercise-item {
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  display: flex;
  gap: 15px;
}

.exercise-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.exercise-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 5px;
  flex-shrink: 0;
}

.exercise-text {
  flex-grow: 1;
  text-align: left;
}

.exercise-name {
  font-weight: bold;
  font-size: 1.2em;
  color: #2c3e50;
  display: block;
}

.exercise-category {
  font-size: 0.9em;
  color: #777;
  margin-left: 5px;
}

.exercise-description {
  margin-top: 5px;
  color: #555;
  font-size: 0.9em;
  line-height: 1.5;
}

.exercise-stats {
  margin-top: 15px;
  border-top: 1px solid #ddd;
  padding-top: 10px;
}

.exercise-stats p {
  margin: 0;
}

.exercise-stats ul {
  list-style-type: none;
  padding: 0;
  margin-top: 5px;
  font-size: 0.9em;
}

.exercise-stats li {
  color: #666;
  margin-bottom: 3px;
}
</style>
