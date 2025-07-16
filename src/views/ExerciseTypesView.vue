<template>
  <div class="page-container">
    <h1>Typy Ćwiczeń</h1>
    <button @click="goBack" class="back-button">Wróć</button>

    <div class="add-type-section">
      <h3>Dodaj nowy typ ćwiczenia</h3>
      <form @submit.prevent="addNewExerciseType">
        <input
          type="text"
          v-model="newTypeName"
          placeholder="Nazwa ćwiczenia (np. Jeżdżenie na rowerze)"
          required
        />
        <select v-model="newTypeCategory" required>
          <option value="">Wybierz kategorię</option>
          <option value="cardio">Kardio</option>
          <option value="strength">Siłowe</option>
        </select>
        <textarea
          v-model="newTypeDescription"
          placeholder="Opis / Instrukcje ćwiczenia"
        ></textarea>
        <input
          type="text"
          v-model="newTypeImageUrl"
          placeholder="URL do zdjęcia (opcjonalnie)"
        />
        <button type="submit">Dodaj typ</button>
      </form>
      <p v-if="addTypeError" class="error-message">{{ addTypeError }}</p>
    </div>

    <hr />

    <div class="existing-types-section">
      <h3>Twoje typy ćwiczeń ({{ allExerciseTypes.length }})</h3>
      <p v-if="allExerciseTypes.length === 0">Brak dodanych typów ćwiczeń.</p>
      <ul class="type-list">
        <li v-for="type in allExerciseTypes" :key="type.id" class="type-item">
          <div class="type-header">
            <h4>
              {{ type.name }}
              <span class="category-tag" :class="type.category">{{
                type.category === "cardio" ? "Kardio" : "Siłowe"
              }}</span>
            </h4>
            <button
              @click="removeExerciseType(type.id)"
              class="remove-type-button"
            >
              Usuń
            </button>
          </div>
          <img
            v-if="type.imageUrl"
            :src="type.imageUrl"
            alt="Zdjęcie ćwiczenia"
            class="type-image"
          />
          <p class="type-description">
            {{ type.description || "Brak opisu." }}
          </p>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { ExerciseType } from "@/store"; // Importujemy interfejs

export default defineComponent({
  name: "ExerciseTypesView",
  setup() {
    const store = useStore();
    const router = useRouter();

    const newTypeName = ref("");
    const newTypeCategory = ref("");
    const newTypeDescription = ref("");
    const newTypeImageUrl = ref("");
    const addTypeError = ref<string | null>(null);

    // Pobierz wszystkie typy ćwiczeń ze store
    const allExerciseTypes = computed<ExerciseType[]>(
      () => store.getters.allExerciseTypes
    );

    const addNewExerciseType = async () => {
      addTypeError.value = null;
      if (!newTypeName.value || !newTypeCategory.value) {
        addTypeError.value = "Nazwa i kategoria są wymagane.";
        return;
      }
      try {
        await store.dispatch("addExerciseType", {
          name: newTypeName.value,
          category: newTypeCategory.value,
          description: newTypeDescription.value,
          imageUrl: newTypeImageUrl.value,
        });
        // Wyczyść formularz
        newTypeName.value = "";
        newTypeCategory.value = "";
        newTypeDescription.value = "";
        newTypeImageUrl.value = "";
        alert("Typ ćwiczenia dodany!");
      } catch (error: any) {
        addTypeError.value =
          error.message || "Wystąpił błąd podczas dodawania typu ćwiczenia.";
      }
    };

    const removeExerciseType = async (id: string) => {
      // Ta akcja nie jest jeszcze zaimplementowana w store
      // Trzeba by dodać akcję 'removeExerciseType' w store
      // i usunąć ten typ z 'exerciseTypes'
      alert("Funkcja usuwania typu ćwiczenia niezaimplementowana w tym demo.");
      // store.dispatch('removeExerciseType', id);
    };

    const goBack = () => {
      router.back();
    };

    return {
      newTypeName,
      newTypeCategory,
      newTypeDescription,
      newTypeImageUrl,
      addTypeError,
      allExerciseTypes,
      addNewExerciseType,
      removeExerciseType,
      goBack,
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
  background-color: #6c757d; /* Szary */
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

hr {
  border: none;
  border-top: 1px solid #eee;
  margin: 40px 0;
}

.add-type-section,
.existing-types-section {
  background-color: #ffffff;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  margin-bottom: 30px;
  text-align: left;
}

.add-type-section h3,
.existing-types-section h3 {
  font-size: 1.5em;
  color: #42b983;
  margin-bottom: 20px;
  text-align: center;
}

.add-type-section form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.add-type-section input[type="text"],
.add-type-section select,
.add-type-section textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1em;
}

.add-type-section textarea {
  min-height: 80px;
  resize: vertical;
}

.add-type-section button[type="submit"] {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1.1em;
  transition: background-color 0.3s ease;
}

.add-type-section button[type="submit"]:hover {
  background-color: #0056b3;
}

.type-list {
  list-style: none;
  padding: 0;
}

.type-item {
  background-color: #e8f5e9;
  border: 1px solid #c8e6c9;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.type-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 10px;
}

.type-header h4 {
  margin: 0;
  font-size: 1.2em;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 8px;
}

.category-tag {
  background-color: #6c757d;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8em;
}

.category-tag.cardio {
  background-color: #28a745; /* Zielony */
}

.category-tag.strength {
  background-color: #007bff; /* Niebieski */
}

.remove-type-button {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.8em;
}

.remove-type-button:hover {
  background-color: #c82333;
}

.type-image {
  max-width: 100%;
  height: auto;
  border-radius: 5px;
  margin-bottom: 10px;
}

.type-description {
  font-size: 0.9em;
  color: #555;
  line-height: 1.5;
}

.error-message {
  color: #dc3545;
  margin-top: 10px;
  font-size: 0.9em;
  text-align: center;
}
</style>
