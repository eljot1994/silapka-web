<template>
  <div class="view-container">
    <h1>Typy Ćwiczeń</h1>

    <div class="exercise-types-section">
      <h3>
        {{ isEditing ? "Edytuj typ ćwiczenia" : "Dodaj nowy typ ćwiczenia" }}
      </h3>
      <form @submit.prevent="handleFormSubmit" class="add-form">
        <div class="form-group">
          <label for="name">Nazwa:</label>
          <input type="text" id="name" v-model="exerciseForm.name" required />
        </div>
        <div class="form-group">
          <label for="category">Kategoria:</label>
          <select id="category" v-model="exerciseForm.category" required>
            <option value="" disabled>Wybierz kategorię</option>
            <option value="strength">Siłowe</option>
            <option value="cardio">Cardio</option>
            <option value="flexibility">Mobilność i Elastyczność</option>
            <option value="recovery">Odnowa i Regeneracja</option>
          </select>
        </div>

        <div class="form-group" v-if="exerciseForm.category === 'strength'">
          <label for="parties">Partie mięśniowe:</label>
          <select id="parties" v-model="exerciseForm.parties" multiple>
            <option
              v-for="partia in partieMiesniowe"
              :key="partia"
              :value="partia"
            >
              {{ partia }}
            </option>
          </select>
          <small>Przytrzymaj Ctrl/Cmd, aby zaznaczyć wiele.</small>
        </div>

        <div class="form-group">
          <label for="description">Opis:</label>
          <textarea
            id="description"
            v-model="exerciseForm.description"
          ></textarea>
        </div>
        <div class="form-group">
          <label for="imageUrl">URL zdjęcia (opcjonalnie):</label>
          <input type="text" id="imageUrl" v-model="exerciseForm.imageUrl" />
        </div>
        <button type="submit" class="submit-button">
          {{ isEditing ? "Zapisz zmiany" : "Dodaj typ" }}
        </button>
        <button
          v-if="isEditing"
          @click="cancelEdit"
          type="button"
          class="cancel-button"
        >
          Anuluj
        </button>
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
              <p class="exercise-description">
                {{ type.description || "Brak opisu." }}
              </p>
              <p
                v-if="type.parties && type.parties.length > 0"
                class="exercise-parties"
              >
                <strong>Partie:</strong> {{ type.parties.join(", ") }}
              </p>

              <div class="exercise-stats" v-if="type.lastUsedDate">
                <p>
                  <strong>Ostatnio ({{ type.lastUsedDate }}):</strong>
                </p>
                <ul>
                  <li v-if="type.category === 'strength' && type.lastUsedSets">
                    Serie: {{ type.lastUsedSets.length }}, Max ciężar:
                    {{ formatWeight(getMaxWeight(type.lastUsedSets)) }}
                    {{ weightUnitLabel }}
                  </li>
                  <li
                    v-if="type.category === 'cardio' && type.lastUsedDuration"
                  >
                    Czas: {{ type.lastUsedDuration }} min
                  </li>
                  <li
                    v-if="type.category === 'flexibility' && type.lastUsedReps"
                  >
                    Powtórzenia: {{ type.lastUsedReps }}
                  </li>
                  <li
                    v-if="
                      type.category === 'flexibility' && type.lastUsedDuration
                    "
                  >
                    Czas: {{ type.lastUsedDuration }} min
                  </li>
                  <li
                    v-if="type.category === 'recovery' && type.lastUsedDuration"
                  >
                    Czas: {{ type.lastUsedDuration }} min
                  </li>
                </ul>
              </div>

              <div class="exercise-stats">
                <p><strong>Statystyki historyczne:</strong></p>
                <ul>
                  <li>
                    Użyto w treningu: {{ getStats(type.id).usageCount }} razy
                  </li>
                  <li v-if="getStats(type.id).category === 'strength'">
                    Rekordowy ciężar:
                    <span v-if="getStats(type.id).maxWeight">
                      {{ formatWeight(getStats(type.id).maxWeight) }}
                      {{ weightUnitLabel }}
                    </span>
                    <span v-else>-</span>
                  </li>
                  <li v-if="getStats(type.id).category === 'strength'">
                    Łącznie serii: {{ getStats(type.id).totalSets || "-" }}
                  </li>
                  <li
                    v-if="
                      getStats(type.id).category === 'cardio' ||
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
          <div class="exercise-actions">
            <button @click="editType(type)" class="edit-button">Edytuj</button>
            <button @click="deleteType(type.id)" class="delete-button">
              Usuń
            </button>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from "vue";
import { useStore } from "vuex";
import { ExerciseType, SessionSet, TrainingRecord } from "@/store";
import { formatWeight as formatWeightUtil } from "@/utils/weight";

export default defineComponent({
  name: "ExerciseTypesView",
  setup() {
    const store = useStore();
    const weightUnitLabel = computed(
      () => store.getters.userSettings.weightUnit
    );

    const partieMiesniowe = ref([
      "Klatka piersiowa",
      "Plecy",
      "Nogi",
      "Barki",
      "Biceps",
      "Triceps",
      "Brzuch",
      "Przedramiona",
      "Łydki",
    ]);

    const getInitialFormState = (): Partial<ExerciseType> => ({
      name: "",
      category: "" as any,
      description: "",
      imageUrl: "",
      parties: [],
    });

    const exerciseForm = ref<Partial<ExerciseType>>(getInitialFormState());
    const isEditing = ref(false);

    const allExerciseTypes = computed<ExerciseType[]>(() =>
      [...store.getters.allExerciseTypes].sort((a, b) =>
        a.name.localeCompare(b.name)
      )
    );
    const trainingHistory = computed<TrainingRecord[]>(
      () => store.getters.allTrainingHistory
    );

    const resetForm = () => {
      exerciseForm.value = getInitialFormState();
      isEditing.value = false;
    };

    const handleFormSubmit = () => {
      if (isEditing.value) {
        store.dispatch("updateExerciseType", exerciseForm.value);
      } else {
        store.dispatch("addExerciseType", exerciseForm.value);
      }
      resetForm();
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

    const getMaxWeight = (sets: SessionSet[] | undefined) => {
      if (!sets) return 0;
      return sets.reduce(
        (max, set) => (set.weight && set.weight > max ? set.weight : max),
        0
      );
    };

    const getStats = (typeId: string) => {
      const exerciseType = allExerciseTypes.value.find(
        (type) => type.id === typeId
      );
      if (!exerciseType) return { usageCount: 0 };

      const stats = {
        usageCount: 0,
        totalSets: 0,
        maxWeight: 0,
        totalDuration: 0,
        category: exerciseType.category,
      };

      trainingHistory.value.forEach((training) => {
        training.exercises.forEach((exercise) => {
          if (
            exercise.exerciseTypeId === typeId &&
            (exercise.done ||
              (exercise.sets && exercise.sets.some((s) => s.done)))
          ) {
            stats.usageCount++;

            if (exercise.category === "strength" && exercise.sets) {
              exercise.sets.forEach((set) => {
                if (set.done) {
                  stats.totalSets++;
                  if (set.weight && set.weight > stats.maxWeight) {
                    stats.maxWeight = set.weight;
                  }
                }
              });
            } else if (exercise.category !== "strength" && exercise.done) {
              stats.totalDuration += exercise.duration || 0;
            }
          }
        });
      });

      return stats;
    };

    const editType = (type: ExerciseType) => {
      isEditing.value = true;
      exerciseForm.value = { ...type };
      window.scrollTo(0, 0);
    };

    const cancelEdit = () => {
      resetForm();
    };

    const deleteType = (typeId: string) => {
      if (confirm("Czy na pewno chcesz usunąć to ćwiczenie?")) {
        store.dispatch("deleteExerciseType", typeId);
      }
    };

    return {
      exerciseForm,
      isEditing,
      allExerciseTypes,
      partieMiesniowe,
      handleFormSubmit,
      getCategoryName,
      getMaxWeight,
      getStats,
      editType,
      cancelEdit,
      deleteType,
      weightUnitLabel,
      formatWeight: (w: number | null) =>
        formatWeightUtil(w, weightUnitLabel.value),
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
}
.cancel-button {
  background-color: #6c757d;
  margin-top: 10px;
}
.exercise-item {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.exercise-actions {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex-shrink: 0;
}
.exercise-actions button {
  padding: 3px 8px;
  font-size: 0.8em;
  border-radius: 4px;
  border: none;
  cursor: pointer;
}
.edit-button {
  background-color: #ffc107;
}
.delete-button {
  background-color: #dc3545;
  color: white;
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

select[multiple] {
  height: 120px;
}
small {
  font-size: 0.8em;
  color: #777;
  margin-top: 5px;
}

.submit-button,
.cancel-button {
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
}

.exercise-content {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  flex-grow: 1;
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
.exercise-parties {
  font-size: 0.8em;
  color: #333;
  margin-top: 8px;
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
