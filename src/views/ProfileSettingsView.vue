<template>
  <div class="view-container">
    <button @click="goBackToProfile" class="back-button">
      &larr; Wróć do profilu
    </button>
    <h1>Ustawienia</h1>
    <form @submit.prevent="saveSettings" class="settings-form">
      <div class="form-group">
        <label for="rest-duration"
          >Domyślny czas odpoczynku (w sekundach)</label
        >
        <input
          type="number"
          id="rest-duration"
          v-model.number="settings.restDuration"
        />
      </div>
      <button type="submit" class="action-button primary">Zapisz zmiany</button>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { useStore } from "vuex";
import { useToast } from "vue-toastification";
import { useRouter } from "vue-router";

export default defineComponent({
  name: "ProfileSettingsView",
  setup() {
    const store = useStore();
    const toast = useToast();
    const router = useRouter();

    const goBackToProfile = () => router.push({ name: "profile" });

    const settings = ref({ ...store.getters.userSettings });

    const saveSettings = async () => {
      try {
        await store.dispatch("updateUserSettings", settings.value);
        toast.success("Ustawienia zostały zapisane!");
      } catch (error) {
        toast.error("Nie udało się zapisać ustawień.");
      }
    };

    return {
      settings,
      saveSettings,
      goBackToProfile,
    };
  },
});
</script>

<style scoped>
.view-container {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
  position: relative;
}
.back-button {
  position: absolute;
  top: 20px;
  left: 20px;
  background: none;
  border: none;
  font-weight: bold;
  cursor: pointer;
  color: #007bff;
}
h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 30px;
}
.settings-form {
  background-color: #fff;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.form-group {
  margin-bottom: 20px;
}
label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
}
input {
  width: 100%;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
  font-size: 1em;
}
.action-button {
  width: 100%;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 1em;
  font-weight: bold;
  cursor: pointer;
  background-color: #42b983;
  color: white;
}
</style>
