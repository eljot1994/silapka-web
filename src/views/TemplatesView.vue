<template>
  <div class="page-container">
    <h1>Szablony Treningów</h1>
    <button @click="goBack" class="back-button">Wróć</button>

    <div class="templates-section">
      <p v-if="templates.length === 0" class="info-message">
        Brak zapisanych szablonów.
      </p>

      <ul v-else class="template-list">
        <li
          v-for="template in templates"
          :key="template.id"
          class="template-item"
        >
          <span class="template-name">{{ template.name }}</span>
          <div class="template-actions">
            <button @click="loadTemplate(template.id)" class="load-button">
              Wczytaj
            </button>
            <button @click="deleteTemplate(template.id)" class="delete-button">
              Usuń
            </button>
          </div>
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

export default defineComponent({
  name: "TemplatesView",
  setup() {
    const store = useStore();
    const router = useRouter();

    const templates = computed<TrainingTemplate[]>(
      () => store.getters.allTrainingTemplates
    );

    const goBack = () => {
      router.back();
    };

    const loadTemplate = (templateId: string) => {
      if (
        confirm(
          "Czy na pewno chcesz wczytać ten szablon? Spowoduje to nadpisanie obecnego planu treningu."
        )
      ) {
        store.dispatch("loadTemplateIntoCurrentTraining", templateId);
        router.push({ name: "welcome" });
      }
    };

    const deleteTemplate = (templateId: string) => {
      if (confirm("Czy na pewno chcesz usunąć ten szablon?")) {
        store.dispatch("deleteTemplate", templateId);
      }
    };

    return {
      templates,
      goBack,
      loadTemplate,
      deleteTemplate,
    };
  },
});
</script>

<style scoped>
/* Style podobne do HistoryView dla spójności */
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

.templates-section {
  background-color: #ffffff;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.info-message {
  text-align: center;
  color: #777;
}

.template-list {
  list-style: none;
  padding: 0;
}

.template-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #eee;
}

.template-name {
  font-weight: bold;
}

.template-actions button {
  margin-left: 10px;
  padding: 5px 10px;
  border-radius: 5px;
  border: none;
  cursor: pointer;
}

.load-button {
  background-color: #28a745;
  color: white;
}

.delete-button {
  background-color: #dc3545;
  color: white;
}
</style>
