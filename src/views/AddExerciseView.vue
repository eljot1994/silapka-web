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
        <select id="exercise-type" v-model="selectedExerciseTypeId" required>
          <option value="">-- Wybierz --</option>
          <optgroup
            v-for="(group, category) in groupedExercises"
            :key="category"
            :label="getCategoryName(category)"
          >
            <option
              v-for="type in group"
              :key="type.id"
              :value="type.id"
              :disabled="isExerciseLocked(type).locked"
            >
              {{ type.name }}
              <span v-if="isExerciseLocked(type).locked"
                >( Regeneracja: {{ isExerciseLocked(type).timeLeft }} )</span
              >
            </option>
          </optgroup>
        </select>
        <button type="submit" :disabled="!selectedExerciseTypeId">
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
import { ExerciseType, LastTrainedParties } from "@/store";

export default defineComponent({
  name: "AddExerciseView",
  setup() {
    const store = useStore();
    const router = useRouter();

    const selectedExerciseTypeId = ref("");
    const addPlanError = ref<string | null>(null);

    const allExerciseTypes = computed<ExerciseType[]>(
      () => store.getters.allExerciseTypes
    );
    const lastTrainedParties = computed<LastTrainedParties>(
      () => store.getters.lastTrainedParties
    );

    const groupedExercises = computed(() => {
      const groups: Record<string, ExerciseType[]> = {};
      const sortedTypes = [...allExerciseTypes.value].sort((a, b) =>
        a.name.localeCompare(b.name)
      );

      sortedTypes.forEach((exercise) => {
        if (!groups[exercise.category]) {
          groups[exercise.category] = [];
        }
        groups[exercise.category].push(exercise);
      });
      return groups;
    });

    const isExerciseLocked = (type: ExerciseType) => {
      if (!type.parties || type.parties.length === 0) {
        return { locked: false, timeLeft: "" };
      }

      const twentyFourHours = 24 * 60 * 60 * 1000;
      const now = Date.now();

      for (const party of type.parties) {
        const lastTrained = lastTrainedParties.value[party];
        if (lastTrained && now - lastTrained < twentyFourHours) {
          const timeLeftMs = twentyFourHours - (now - lastTrained);
          const hoursLeft = Math.ceil(timeLeftMs / (1000 * 60 * 60));
          return { locked: true, timeLeft: `${hoursLeft}h` };
        }
      }
      return { locked: false, timeLeft: "" };
    };

    const addExerciseToPlan = async () => {
      addPlanError.value = null;
      if (!selectedExerciseTypeId.value) {
        addPlanError.value = "Wybierz typ ćwiczenia.";
        return;
      }
      try {
        await store.dispatch("addExerciseToPlan", selectedExerciseTypeId.value);
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
      selectedExerciseTypeId,
      addPlanError,
      allExerciseTypes,
      groupedExercises,
      isExerciseLocked,
      addExerciseToPlan,
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
}
h1 {
  color: #2c3e50;
  margin-bottom: 30px;
}
.add-to-plan-section {
  background-color: #ffffff;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  text-align: left;
}
.info-message,
.error-message {
  text-align: center;
  color: #777;
}
.error-message {
  color: #dc3545;
  margin-top: 10px;
}
label {
  display: block;
  font-weight: bold;
  margin-bottom: 10px;
}
select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1em;
  margin-bottom: 20px;
}
option:disabled {
  color: #aaa;
}
button[type="submit"] {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1.1em;
  width: 100%;
}
button[type="submit"]:disabled {
  background-color: #a0a0a0;
  cursor: not-allowed;
}
</style>
