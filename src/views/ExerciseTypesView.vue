<template>
  <div class="page-container">
    <h1>Typy Ćwiczeń</h1>
    <button @click="goBack" class="back-button">Wróć</button>

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
import { useRouter } from "vue-router";
import { ExerciseType, TrainingRecord } from "@/store";

export default defineComponent({
  name: "ExerciseTypesView",
  setup() {
    const store = useStore();
    const router = useRouter();

    const getInitialFormState = (): Partial<ExerciseType> => ({
      name: "",
      category: "" as any,
      description: "",
      imageUrl: "",
    });

    const exerciseForm = ref<Partial<ExerciseType>>(getInitialFormState());
    const isEditing = ref(false);

    const allExerciseTypes = computed<ExerciseType[]>(
      () => store.getters.allExerciseTypes
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

    const goBack = () => {
      router.back();
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
      if (
        confirm(
          "Czy na pewno chcesz usunąć to ćwiczenie? Spowoduje to również usunięcie go ze wszystkich szablonów i historii treningów."
        )
      ) {
        store.dispatch("deleteExerciseType", typeId);
      }
    };

    return {
      exerciseForm,
      isEditing,
      allExerciseTypes,
      handleFormSubmit,
      getCategoryName,
      goBack,
      editType,
      cancelEdit,
      deleteType,
    };
  },
});
</script>

<style scoped>
.cancel-button {
  background-color: #6c757d;
  margin-top: 10px;
}
.exercise-item {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.exercise-actions {
  display: flex;
  flex-direction: column;
  gap: 5px;
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
  align-items: center;
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
</style>
