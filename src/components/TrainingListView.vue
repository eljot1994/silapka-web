<template>
  <div class="view-container">
    <BackButton :to="{ name: 'profile' }" text="Wróć do profilu" />
    <h1>{{ title }}</h1>

    <div class="content-section">
      <div v-if="!items || items.length === 0" class="info-message">
        <p>{{ emptyMessage }}</p>
        <p v-if="emptyDetails" class="info-details">{{ emptyDetails }}</p>
      </div>

      <ul v-else class="item-list">
        <li v-for="item in items" :key="item.id" class="list-item">
          <div class="item-header">
            <slot name="item-header" :item="item"></slot>
          </div>

          <p class="exercises-summary">
            Zaplanowane ćwiczenia ({{ item.exercises.length }}):
          </p>

          <ul class="exercise-summary-list">
            <slot name="exercise-list" :item="item"></slot>
          </ul>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import BackButton from "@/components/BackButton.vue";

export default defineComponent({
  name: "TrainingListView",
  components: {
    BackButton,
  },
  props: {
    title: {
      type: String,
      required: true,
    },
    items: {
      type: Array as PropType<{ id: string; exercises: any[] }[]>,
      required: true,
    },
    emptyMessage: {
      type: String,
      required: true,
    },
    emptyDetails: {
      type: String,
      default: "",
    },
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
h1 {
  color: #2c3e50;
  margin-bottom: 30px;
  font-size: 2em;
}
.content-section {
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
.item-list {
  list-style: none;
  padding: 0;
}
.list-item {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
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
</style>
