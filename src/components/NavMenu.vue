<template>
  <nav class="bottom-nav">
    <button @click="goToWelcome" class="nav-button" title="Główna">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height="24px"
        viewBox="0 0 24 24"
        width="24px"
        fill="currentColor"
      >
        <path d="M0 0h24v24H0z" fill="none" />
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
      </svg>
      <span>Główna</span>
    </button>
    <button @click="goToExerciseTypes" class="nav-button" title="Typy ćwiczeń">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height="24px"
        viewBox="0 0 24 24"
        width="24px"
        fill="currentColor"
      >
        <path d="M0 0h24v24H0z" fill="none" />
        <path
          d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z"
        />
      </svg>
      <span>Ćwiczenia</span>
    </button>
    <button @click="goToProfile" class="nav-button" title="Profil">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height="24px"
        viewBox="0 0 24 24"
        width="24px"
        fill="currentColor"
      >
        <path d="M0 0h24v24H0z" fill="none" />
        <path
          d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
        />
      </svg>
      <span>Profil</span>
    </button>
    <button
      @click="handleLogout"
      class="nav-button logout-button"
      title="Wyloguj"
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
          d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"
        />
      </svg>
      <span>Wyloguj</span>
    </button>
  </nav>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";

export default defineComponent({
  name: "NavMenu",
  setup() {
    const router = useRouter();
    const store = useStore();

    const goToWelcome = () => router.push({ name: "welcome" });
    const goToExerciseTypes = () => router.push({ name: "exercise-types" });
    const goToProfile = () => router.push({ name: "profile" });

    const handleLogout = async () => {
      await store.dispatch("logout");
      router.push({ name: "home" });
    };

    return {
      goToWelcome,
      goToExerciseTypes,
      goToProfile,
      handleLogout,
    };
  },
});
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  background-color: #fff;
  box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
  padding: 10px 0;
  z-index: 1000;
}
.nav-button {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #5f6368;
  font-size: 0.75em;
  gap: 4px;
  flex: 1;
}
.nav-button svg {
  fill: #5f6368;
}
.logout-button {
  color: #dc3545;
}
.logout-button svg {
  fill: #dc3545;
}
</style>
