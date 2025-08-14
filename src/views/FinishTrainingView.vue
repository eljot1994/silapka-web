<template>
  <div class="view-container">
    <h1>Zakończono Trening</h1>
    <p>Gratulacje! Twój trening został zapisany w historii.</p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "FinishTrainingView",
  setup() {
    return {};
  },
});
</script>

<style scoped>
.view-container {
  padding: 40px 20px;
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
}
h1 {
  color: #2c3e50;
  margin-bottom: 20px;
}
</style>
