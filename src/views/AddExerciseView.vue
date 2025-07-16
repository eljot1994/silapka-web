<template>
  <div class="page-container">
    <h1>Dodaj Ćwiczenie do Treningu</h1>
    <button @click="goBack" class="back-button">Wróć</button>

    <div class="add-to-plan-section">
      <p v-if="allExerciseTypes.length === 0" class="info-message">
        Brak dostępnych typów ćwiczeń. Przejdź do "Typy ćwiczeń", aby dodać
        nowe.
      </p>
      <form v-else @submit.prevent="addExerciseToPlan">
        <label for="exercise-type">Wybierz typ ćwiczenia:</label>
        <select
          id="exercise-type"
          v-model="selectedExerciseTypeId"
          required
          @change="onExerciseTypeChange"
        >
          <option value="">-- Wybierz --</option>
          <option
            v-for="type in allExerciseTypes"
            :key="type.id"
            :value="type.id"
          >
            {{ type.name }} ({{
              type.category === "cardio" ? "Kardio" : "Siłowe"
            }})
          </option>
        </select>

        <div v-if="selectedExerciseType" class="exercise-params">
          <h4>Parametry dla: {{ selectedExerciseType.name }}</h4>
          <p class="description-text">
            {{ selectedExerciseType.description || "Brak opisu." }}
          </p>
          <img
            v-if="selectedExerciseType.imageUrl"
            :src="selectedExerciseType.imageUrl"
            alt="Zdjęcie ćwiczenia"
            class="param-image"
          />

          <div v-if="selectedExerciseType.category === 'cardio'">
            <label
              >Długość (min):
              <input
                type="number"
                v-model.number="cardioParams.duration"
                placeholder="Długość w minutach"
                required
                min="1"
              />
            </label>
          </div>
        </div>

        <button type="submit" :disabled="!selectedExerciseType">
          Dodaj do planu treningu
        </button>
      </form>
      <p v-if="addPlanError" class="error-message">{{ addPlanError }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { ExerciseType } from "@/store";

export default defineComponent({
  name: "AddExerciseView",
  setup() {
    const store = useStore();
    const router = useRouter();

    const selectedExerciseTypeId = ref("");
    // Usunięto strengthParams - serie dodajemy na WelcomeView
    const cardioParams = ref({ duration: null as number | null });
    const addPlanError = ref<string | null>(null);

    const allExerciseTypes = computed<ExerciseType[]>(
      () => store.getters.allExerciseTypes
    );
    const selectedExerciseType = computed<ExerciseType | undefined>(() =>
      allExerciseTypes.value.find(
        (type) => type.id === selectedExerciseTypeId.value
      )
    );

    const onExerciseTypeChange = () => {
      cardioParams.value = { duration: null };
      addPlanError.value = null;
    };

    const addExerciseToPlan = async () => {
      addPlanError.value = null;
      if (!selectedExerciseType.value) {
        addPlanError.value = "Wybierz typ ćwiczenia.";
        return;
      }

      let params: any = {};
      if (selectedExerciseType.value.category === "strength") {
        // Dla siłowych nie przekazujemy tu parametrów serii, bo będą puste na start
        // Vuex sam zainicjuje pustą tablicę `sets`
        // Można tu dodać alert, że serie dodajemy później, ale lepiej zostawić to UX
      } else if (selectedExerciseType.value.category === "cardio") {
        if (
          cardioParams.value.duration === null ||
          cardioParams.value.duration <= 0
        ) {
          addPlanError.value =
            "Długość ćwiczenia kardio musi być liczbą dodatnią.";
          return;
        }
        params = { ...cardioParams.value };
      }

      try {
        await store.dispatch("addExerciseToPlan", {
          exerciseTypeId: selectedExerciseTypeId.value,
          params: params,
        });
        alert("Ćwiczenie dodane do planu treningu!");
        router.push({ name: "welcome" });
      } catch (error: any) {
        addPlanError.value =
          error.message ||
          "Wystąpił błąd podczas dodawania ćwiczenia do planu.";
      }
    };

    const goBack = () => {
      router.back();
    };

    return {
      selectedExerciseTypeId,
      cardioParams,
      addPlanError,
      allExerciseTypes,
      selectedExerciseType,
      onExerciseTypeChange,
      addExerciseToPlan,
      goBack,
    };
  },
});
</script>

<style scoped>
/* Style bez zmian od poprzedniego razu, bo usunęliśmy tylko część template */
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

.add-to-plan-section {
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

.add-to-plan-section label {
  display: block;
  font-weight: bold;
  margin-bottom: 10px;
  color: #2c3e50;
}

.add-to-plan-section select,
.add-to-plan-section input[type="number"] {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1em;
  margin-bottom: 20px;
}

.exercise-params {
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 8px;
  background-color: #f0f8ff;
  margin-bottom: 20px;
}

.exercise-params h4 {
  text-align: center;
  color: #007bff;
  margin-bottom: 15px;
}

.exercise-params label {
  display: block;
  margin-bottom: 10px;
}

.exercise-params input[type="number"] {
  margin-bottom: 0;
}

.description-text {
  font-size: 0.9em;
  color: #555;
  margin-bottom: 15px;
}

.param-image {
  max-width: 100%;
  height: auto;
  border-radius: 5px;
  margin-bottom: 15px;
}

.add-to-plan-section button[type="submit"] {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1.1em;
  transition: background-color 0.3s ease;
  width: 100%;
}

.add-to-plan-section button[type="submit"]:hover:not(:disabled) {
  background-color: #368a65;
}

.add-to-plan-section button[type="submit"]:disabled {
  background-color: #a0a0a0;
  cursor: not-allowed;
}

.error-message {
  color: #dc3545;
  margin-top: 10px;
  font-size: 0.9em;
  text-align: center;
}
</style>
