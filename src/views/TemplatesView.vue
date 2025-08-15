<template>
  <TrainingListView
    title="Szablony Treningów"
    :items="allTrainingTemplates"
    empty-message="Brak zapisanych szablonów."
    empty-details="Aby dodać nowy szablon, przygotuj listę ćwiczeń na stronie głównej, a następnie użyj opcji 'Zapisz jako szablon'."
  >
    <template #item-header="{ item }">
      <h4 class="template-title">{{ item.name }}</h4>
      <div>
        <button @click="loadTemplate(item.id)" class="action-button primary">
          Wczytaj
        </button>
        <button @click="deleteTemplate(item.id)" class="action-button danger">
          Usuń
        </button>
      </div>
    </template>

    <template #exercise-list="{ item }">
      <li
        v-for="exercise in item.exercises"
        :key="exercise.id"
        class="exercise-summary-item"
      >
        <span class="exercise-name-summary">{{ exercise.name }}</span>
      </li>
    </template>
  </TrainingListView>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { TrainingTemplate } from "@/store";
import { useToast } from "vue-toastification";
import TrainingListView from "@/components/TrainingListView.vue";

export default defineComponent({
  name: "TemplatesView",
  components: {
    TrainingListView,
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    const toast = useToast();

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
/* Używamy :deep() aby styl dotarł do komponentu potomnego */
:deep(.list-item) {
  background-color: #e3f2fd; /* Niebieskie tło */
  border-color: #bbdefb;
}

.template-title {
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
