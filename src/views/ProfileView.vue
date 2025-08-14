<template>
  <div class="view-container">
    <h1>Profil</h1>
    <div class="profile-menu">
      <router-link to="/history" class="menu-item">
        <span>Historia Treningów</span>
      </router-link>
      <router-link to="/templates" class="menu-item">
        <span>Szablony Treningów</span>
      </router-link>
      <router-link to="/stats" class="menu-item">
        <span>Statystyki</span>
      </router-link>
      <router-link to="/settings" class="menu-item">
        <span>Ustawienia</span>
      </router-link>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "ProfileView",
});
</script>

<style scoped>
.view-container {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}
h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 30px;
}
.profile-menu {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.menu-item {
  display: block;
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  text-decoration: none;
  color: #333;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}
.menu-item:hover {
  transform: translateY(-2px);
}
</style>
