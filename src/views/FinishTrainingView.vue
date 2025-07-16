<template>
  <div class="page-container">
    <h1>Zakończ Trening</h1>
    <p>Tutaj będzie podsumowanie zakończonego treningu.</p>
    <button @click="goBack">Wróć do Treningu</button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useRouter } from "vue-router";

export default defineComponent({
  name: "FinishTrainingView",
  setup() {
    const router = useRouter();
    const goBack = () => {
      router.back();
    };
    return { goBack };
  },
});
</script>

<style scoped>
.page-container {
  padding: 40px 20px;
  text-align: center;
  background-color: #e3f2fd;
  border-radius: 10px;
  margin: 50px auto;
  max-width: 600px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
.page-container h1 {
  color: #2c3e50;
  margin-bottom: 20px;
}
.page-container button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 20px;
}
</style>
