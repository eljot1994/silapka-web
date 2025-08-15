<template>
  <div class="view-container">
    <BackButton :to="{ name: 'profile' }" text="Wróć do profilu" />
    <h1>Szablony Treningów</h1>

    <div class="templates-section">
      <div v-if="allTrainingTemplates.length === 0" class="info-message">
        <p>Brak zapisanych szablonów.</p>
        <p class="info-details">
          Aby dodać nowy szablon, przygotuj listę ćwiczeń na stronie głównej, a
          następnie użyj opcji "Zapisz jako szablon".
        </p>
      </div>

      <ul v-else class="template-list">
        <li
          v-for="template in allTrainingTemplates"
          :key="template.id"
          class="template-item"
        >
          <div class="template-header">
            <h4>{{ template.name }}</h4>
            <div>
              <button
                @click="loadTemplate(template.id)"
                class="action-button primary"
              >
                Wczytaj
              </button>
              <button
                @click="deleteTemplate(template.id)"
                class="action-button danger"
              >
                Usuń
              </button>
            </div>
          </div>
          <p class="exercises-summary">
            Zaplanowane ćwiczenia ({{ template.exercises.length }}):
          </p>
          <ul class="exercise-summary-list">
            <li
              v-for="exercise in template.exercises"
              :key="exercise.id"
              class="exercise-summary-item"
            >
              <span class="exercise-name-summary">{{ exercise.name }}</span>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { TrainingTemplate } from "@/store";
import { useToast } from "vue-toastification";
import BackButton from "@/components/BackButton.vue"; // 1. Import komponentu

export default defineComponent({
  name: "TemplatesView",
  components: {
    BackButton, // 2. Zarejestrowanie komponentu
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    const toast = useToast();

    // 3. Usunięto funkcję goBackToProfile, bo jest już w komponencie

    const allTrainingTemplates = computed<TrainingTemplate[]>(() =>
      [...store.getters.allTrainingTemplates].sort((a, b) =>
        a.name.localeCompare(b.name)
      )
    );

    const deleteTemplate = (templateId: string) => {
      if (confirm("Czy na pewno chcesz usunąć ten szablon?")) {
        store.dispatch("deleteTemplate", templateId);
        toast.success("Szablon został usunięty.");
      }
    };

    const loadTemplate = (templateId: string) => {
      if (
        confirm(
          "Czy na pewno chcesz wczytać ten szablon? Spowoduje to nadpisanie Twojego obecnego planu treningowego."
        )
      ) {
        store.dispatch("loadTemplateIntoCurrentTraining", templateId);
        toast.success("Szablon został wczytany do aktualnego treningu.");
        router.push({ name: "welcome" });
      }
    };

    return {
      allTrainingTemplates,
      deleteTemplate,
      loadTemplate,
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
  position: relative;
}
/* Stary styl dla .back-button można teraz usunąć, 
   ponieważ komponent ma swoje własne style */
h1 {
  color: #2c3e50;
  margin-bottom: 30px;
  font-size: 2em;
}
.templates-section {
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
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
}
.info-details {
  margin-top: 10px;
  font-style: normal;
  font-size: 0.9em;
  color: #555;
}
.template-list {
  list-style: none;
  padding: 0;
}
.template-item {
  background-color: #e9e9f5;
  border: 1px solid #c8c8e6;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
.template-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.template-header h4 {
  margin: 0;
  font-size: 1.5em;
  color: #007bff;
}
.action-button {
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  margin-left: 10px;
  color: white;
}
.action-button.primary {
  background-color: #007bff;
}
.action-button.danger {
  background-color: #dc3545;
}
.exercises-summary {
  font-weight: bold;
  margin-top: 15px;
  margin-bottom: 10px;
}
.exercise-summary-list {
  list-style: none;
  padding-left: 0;
  border-left: 2px solid #ccc;
  margin-left: 10px;
}
.exercise-summary-item {
  margin-bottom: 5px;
  padding-left: 10px;
}
.exercise-name-summary {
  font-weight: bold;
  color: #2c3e50;
  font-size: 1em;
}
</style>
