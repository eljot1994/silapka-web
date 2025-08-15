<template>
  <div class="home-container">
    <h1>Witaj w Siłapce!</h1>
    <p>Twoja aplikacja do śledzenia postępów na siłowni.</p>

    <div class="form-container">
      <div class="form-toggle">
        <button
          @click="isLogin = true"
          :class="{ active: isLogin }"
          class="toggle-button"
        >
          Logowanie
        </button>
        <button
          @click="isLogin = false"
          :class="{ active: !isLogin }"
          class="toggle-button"
        >
          Rejestracja
        </button>
      </div>

      <form v-if="isLogin" @submit.prevent="handleLogin" class="auth-form">
        <h3>Zaloguj się</h3>
        <div class="form-group">
          <input
            type="email"
            placeholder="Email"
            v-model="loginForm.email"
            required
          />
        </div>
        <div class="form-group">
          <input
            type="password"
            placeholder="Hasło"
            v-model="loginForm.password"
            required
          />
        </div>
        <button type="submit" :disabled="isLoading">
          <span v-if="isLoading" class="spinner"></span>
          <span v-else>Zaloguj</span>
        </button>
      </form>

      <form v-else @submit.prevent="handleSignup" class="auth-form">
        <h3>Zarejestruj się</h3>
        <div class="form-group">
          <input
            type="email"
            placeholder="Email"
            v-model="signupForm.email"
            @blur="handleBlur('email')"
            @input="handleInput('email')"
            required
          />
          <p v-if="signupErrors.email" class="validation-error">
            {{ signupErrors.email }}
          </p>
        </div>
        <div class="form-group">
          <input
            type="password"
            placeholder="Hasło"
            v-model="signupForm.password"
            @blur="handleBlur('password')"
            @input="handleInput('password')"
            required
          />
          <p v-if="signupErrors.password" class="validation-error">
            {{ signupErrors.password }}
          </p>
        </div>
        <div class="form-group">
          <input
            type="password"
            placeholder="Potwierdź hasło"
            v-model="signupForm.confirmPassword"
            @blur="handleBlur('confirmPassword')"
            @input="handleInput('confirmPassword')"
            required
          />
          <p v-if="signupErrors.confirmPassword" class="validation-error">
            {{ signupErrors.confirmPassword }}
          </p>
        </div>
        <button type="submit" :disabled="isLoading">
          <span v-if="isLoading" class="spinner"></span>
          <span v-else>Zarejestruj</span>
        </button>
      </form>

      <p v-if="authError" class="error-message">{{ authError }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { useValidation } from "@/composables/useValidation";

type ValidationField = "email" | "password" | "confirmPassword";

export default defineComponent({
  name: "HomeView",
  setup() {
    const store = useStore();
    const router = useRouter();

    const isLogin = ref(true);
    const authError = ref<string | null>(null);
    const isLoading = ref(false);

    const loginForm = ref({
      email: "",
      password: "",
    });

    const signupForm = reactive({
      email: "",
      password: "",
      confirmPassword: "",
    });

    // Śledzi, czy pole zostało już "dotknięte" przez użytkownika
    const formBlurred = reactive({
      email: false,
      password: false,
      confirmPassword: false,
    });

    const {
      signupErrors,
      validateEmail,
      validatePassword,
      validateConfirmPassword,
      isSignupFormValid,
    } = useValidation(signupForm);

    // Funkcja wywoływana po opuszczeniu pola
    const handleBlur = (field: ValidationField) => {
      formBlurred[field] = true;
      // Uruchom walidację od razu po pierwszym opuszczeniu pola
      if (field === "email") validateEmail();
      if (field === "password") validatePassword();
      if (field === "confirmPassword") validateConfirmPassword();
    };

    // Funkcja wywoływana przy każdym wpisanym znaku
    const handleInput = (field: ValidationField) => {
      // Uruchom walidację tylko, jeśli pole było już wcześniej opuszczone
      if (formBlurred[field]) {
        if (field === "email") validateEmail();
        if (field === "password") validatePassword();
        if (field === "confirmPassword") validateConfirmPassword();
      }
    };

    // wewnątrz setup() w src/views/HomeView.vue

    const handleLogin = async () => {
      authError.value = null;
      isLoading.value = true;
      try {
        await store.dispatch("login", loginForm.value);
        router.push({ name: "welcome" });
      } catch (error: any) {
        // Rozszerzona obsługa błędów
        switch (error.code) {
          case "auth/user-not-found":
            authError.value =
              "Nie znaleziono użytkownika o podanym adresie email.";
            break;
          case "auth/wrong-password":
            authError.value = "Nieprawidłowe hasło. Spróbuj ponownie.";
            break;
          case "auth/invalid-credential":
            authError.value =
              "Nieprawidłowe dane logowania. Sprawdź email i hasło.";
            break;
          default:
            authError.value = "Wystąpił błąd podczas logowania.";
            break;
        }
      } finally {
        isLoading.value = false;
      }
    };

    const handleSignup = async () => {
      authError.value = null;
      if (isSignupFormValid()) {
        isLoading.value = true;
        try {
          await store.dispatch("signup", {
            email: signupForm.email,
            password: signupForm.password,
          });
          router.push({ name: "welcome" });
        } catch (error) {
          authError.value = "Nie udało się zarejestrować. Spróbuj ponownie.";
        } finally {
          isLoading.value = false;
        }
      }
    };

    return {
      isLogin,
      authError,
      isLoading,
      loginForm,
      signupForm,
      signupErrors,
      handleLogin,
      handleSignup,
      handleBlur,
      handleInput,
    };
  },
});
</script>

<style scoped>
/* Style pozostają bez zmian */
.spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.home-container {
  text-align: center;
  padding: 40px 20px;
}

h1 {
  font-size: 2.5em;
  color: #2c3e50;
}

p {
  color: #666;
  font-size: 1.2em;
}

.form-container {
  max-width: 400px;
  margin: 30px auto;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.form-toggle {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  background-color: #eee;
  border-radius: 8px;
  padding: 5px;
}

.toggle-button {
  flex: 1;
  padding: 10px;
  border: none;
  background-color: transparent;
  cursor: pointer;
  font-size: 1em;
  color: #555;
  border-radius: 6px;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.toggle-button.active {
  background-color: #42b983;
  color: white;
  font-weight: bold;
}

.auth-form {
  display: flex;
  flex-direction: column;
}

.auth-form h3 {
  margin-bottom: 20px;
  color: #333;
}

.auth-form .form-group {
  margin-bottom: 15px;
  text-align: left;
}

.auth-form input {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1em;
  width: 100%;
  box-sizing: border-box;
}
.auth-form input:not([type="submit"]) {
  margin-bottom: 5px;
}

.auth-form button[type="submit"] {
  padding: 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1.1em;
  margin-top: 10px;
  transition: background-color 0.3s;
  min-height: 48px;
}
.auth-form button[type="submit"]:disabled {
  background-color: #0056b3;
}

.auth-form button[type="submit"]:hover {
  background-color: #0056b3;
}

.error-message {
  color: #dc3545;
  margin-top: 15px;
}

.validation-error {
  color: #dc3545;
  font-size: 0.8em;
  margin: 0;
  padding-left: 5px;
}
</style>
