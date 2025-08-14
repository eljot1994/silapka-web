<template>
  <div id="app">
    <main class="main-content">
      <router-view />
    </main>
    <NavMenu v-if="isAuthenticated" />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { useStore } from "vuex";
import NavMenu from "./components/NavMenu.vue";

export default defineComponent({
  name: "App",
  components: {
    NavMenu,
  },
  setup() {
    const store = useStore();
    const isAuthenticated = computed(() => store.getters.isAuthenticated);

    return {
      isAuthenticated,
    };
  },
});
</script>

<style>
/* Globalne style dla całej aplikacji */
body {
  margin: 0;
  background-color: #f4f4f4; /* Możesz dostosować kolor tła */
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

/* Ten styl zapewnia, że treść nie jest zasłaniana przez menu */
.main-content {
  padding-bottom: 80px; /* Zostawia miejsce na dolne menu */
}
</style>
