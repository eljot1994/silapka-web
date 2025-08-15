<template>
  <div class="main-actions-bar">
    <button @click="$emit('add-exercise')" class="action-button primary">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height="24px"
        viewBox="0 0 24 24"
        width="24px"
        fill="currentColor"
      >
        <path d="M0 0h24v24H0z" fill="none" />
        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
      </svg>
      Dodaj ćwiczenie
    </button>

    <button
      @click="$emit('pause-training')"
      v-if="isTrainingActive && !isTrainingPaused"
      class="action-button warning"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height="24px"
        viewBox="0 0 24 24"
        width="24px"
        fill="currentColor"
      >
        <path d="M0 0h24v24H0z" fill="none" />
        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
      </svg>
      Zatrzymaj
    </button>

    <button
      @click="$emit('resume-training')"
      v-if="isTrainingActive && isTrainingPaused"
      class="action-button secondary"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height="24px"
        viewBox="0 0 24 24"
        width="24px"
        fill="currentColor"
      >
        <path d="M0 0h24v24H0z" fill="none" />
        <path d="M8 5v14l11-7z" />
      </svg>
      Wznów
    </button>

    <button
      @click="$emit('cancel-training')"
      v-if="isTrainingActive"
      class="action-button cancel"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height="24px"
        viewBox="0 0 24 24"
        width="24px"
        fill="currentColor"
      >
        <path d="M0 0h24v24H0z" fill="none" />
        <path
          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"
        />
      </svg>
      Anuluj
    </button>

    <button
      @click="$emit('finish-training')"
      v-if="isTrainingActive"
      class="action-button danger"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height="24px"
        viewBox="0 0 24 24"
        width="24px"
        fill="currentColor"
      >
        <path d="M0 0h24v24H0z" fill="none" />
        <path d="M6 6h12v12H6z" />
      </svg>
      Zakończ
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "TrainingControls",
  props: {
    isTrainingActive: Boolean,
    isTrainingPaused: Boolean,
  },
  emits: [
    "add-exercise",
    "pause-training",
    "resume-training",
    "finish-training",
    "cancel-training",
  ],
});
</script>

<style scoped>
.main-actions-bar {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
}
.action-button {
  width: 100%;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 1em;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 50px;
}
.action-button.primary {
  background-color: #42b983;
  color: white;
}
.action-button.secondary {
  background-color: #007bff;
  color: white;
}
.action-button.danger {
  background-color: #dc3545;
  color: white;
}
.action-button.warning {
  background-color: #ffc107;
  color: #212529;
}
.action-button.cancel {
  background-color: #6c757d;
  color: white;
}
</style>
