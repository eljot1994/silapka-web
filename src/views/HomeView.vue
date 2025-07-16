<template>
  <div class="home-container">
    <header class="app-header">
      <h1>Silapka</h1>
    </header>

    <div class="auth-section">
      <div class="tab-buttons">
        <button
          :class="{ active: currentTab === 'login' }"
          @click="currentTab = 'login'"
        >
          Logowanie
        </button>
        <button
          :class="{ active: currentTab === 'register' }"
          @click="currentTab = 'register'"
        >
          Rejestracja
        </button>
      </div>

      <div v-if="currentTab === 'login'" class="auth-form">
        <h2>Zaloguj się</h2>
        <form @submit.prevent="handleLogin">
          <input
            type="email"
            v-model="loginEmail"
            placeholder="Email"
            required
          />
          <input
            type="password"
            v-model="loginPassword"
            placeholder="Hasło"
            required
          />
          <button type="submit">Zaloguj</button>
          <p v-if="loginError" class="error-message">{{ loginError }}</p>
        </form>
      </div>

      <div v-if="currentTab === 'register'" class="auth-form">
        <h2>Zarejestruj się</h2>
        <form @submit.prevent="handleRegister">
          <input
            type="email"
            v-model="registerEmail"
            placeholder="Email"
            required
          />
          <input
            type="password"
            v-model="registerPassword"
            placeholder="Hasło"
            required
          />
          <input
            type="password"
            v-model="registerPasswordConfirm"
            placeholder="Powtórz hasło"
            required
          />
          <button type="submit">Zarejestruj</button>
          <p v-if="registerError" class="error-message">{{ registerError }}</p>
        </form>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue"; // Usunęliśmy 'watch'
import { useStore } from "vuex";
import { useRouter } from "vue-router";

export default defineComponent({
  name: "HomeView",
  setup() {
    const store = useStore();
    const router = useRouter();

    // Sprawdź, czy użytkownik jest zalogowany przy ładowaniu HomeView
    // Jeśli tak, przekieruj go na stronę powitalną
    if (store.getters.isAuthenticated) {
      router.replace({ name: "welcome" });
    }

    const currentTab = ref<"login" | "register">("login");
    const loginEmail = ref("");
    const loginPassword = ref("");
    const registerEmail = ref("");
    const registerPassword = ref("");
    const registerPasswordConfirm = ref("");
    const loginError = ref<string | null>(null);
    const registerError = ref<string | null>(null);

    // Usunęliśmy 'savedData' oraz powiązane metody i watchery, ponieważ lista nie jest już potrzebna

    const handleLogin = async () => {
      loginError.value = null;
      try {
        await store.dispatch("login", {
          email: loginEmail.value,
          password: loginPassword.value,
        });
      } catch (error: any) {
        loginError.value = error.message || "Wystąpił nieznany błąd logowania.";
      }
    };

    const handleRegister = async () => {
      registerError.value = null;
      if (registerPassword.value !== registerPasswordConfirm.value) {
        registerError.value = "Hasła nie pasują do siebie!";
        return;
      }
      try {
        await store.dispatch("register", {
          email: registerEmail.value,
          password: registerPassword.value,
        });
        currentTab.value = "login";
        registerEmail.value = "";
        registerPassword.value = "";
        registerPasswordConfirm.value = "";
      } catch (error: any) {
        registerError.value =
          error.message || "Wystąpił nieznany błąd rejestracji.";
      }
    };

    return {
      currentTab,
      loginEmail,
      loginPassword,
      registerEmail,
      registerPassword,
      registerPasswordConfirm,
      loginError,
      registerError,
      handleLogin,
      handleRegister,
    };
  },
});
</script>

<style scoped>
/* Style pozostały bez zmian, dodaj tylko styl dla komunikatu o błędzie */
.error-message {
  color: #dc3545;
  margin-top: 10px;
  font-size: 0.9em;
}

/* Pozostałe style z poprzedniego kroku, usunięto te dla data-section */
.home-container {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}

.app-header {
  margin-bottom: 30px;
}

.app-header h1 {
  font-size: 2.5em;
  color: #42b983;
  margin-bottom: 5px;
}

.app-header p {
  color: #666;
}

.auth-section {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px; /* Może być mniejszy margines, bo nie ma już sekcji danych */
}

.tab-buttons {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.tab-buttons button {
  background-color: #eee;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 1em;
  border-radius: 5px;
  margin: 0 5px;
  transition: background-color 0.3s ease;
}

.tab-buttons button.active {
  background-color: #42b983;
  color: white;
  font-weight: bold;
}

.auth-form h2 {
  color: #2c3e50;
  margin-bottom: 20px;
}

.auth-form input {
  width: calc(100% - 20px);
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1em;
}

.auth-form button {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 12px 25px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1.1em;
  transition: background-color 0.3s ease;
}

.auth-form button:hover {
  background-color: #368a65;
}
</style>
