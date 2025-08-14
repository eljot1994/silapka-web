<script lang="ts">
import { defineComponent, ref } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router"; // <-- 1. Import useRouter

export default defineComponent({
  name: "HomeView",
  setup() {
    const store = useStore();
    const router = useRouter(); // <-- 2. Utwórz instancję routera
    const isLogin = ref(true);
    const authError = ref<string | null>(null);
    const isLoading = ref(false);

    const loginForm = ref({
      email: "",
      password: "",
    });

    const signupForm = ref({
      email: "",
      password: "",
      confirmPassword: "",
    });

    const signupErrors = ref({
      email: "",
      password: "",
      confirmPassword: "",
    });

    // --- Funkcje Walidacji (pozostają bez zmian) ---
    const validateEmail = () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!signupForm.value.email) {
        signupErrors.value.email = "Email jest wymagany.";
      } else if (!emailRegex.test(signupForm.value.email)) {
        signupErrors.value.email = "Niepoprawny format email.";
      } else {
        signupErrors.value.email = "";
      }
    };

    const validatePassword = () => {
      if (!signupForm.value.password) {
        signupErrors.value.password = "Hasło jest wymagane.";
      } else if (signupForm.value.password.length < 6) {
        signupErrors.value.password = "Hasło musi mieć co najmniej 6 znaków.";
      } else {
        signupErrors.value.password = "";
      }
      validateConfirmPassword();
    };

    const validateConfirmPassword = () => {
      if (!signupForm.value.confirmPassword) {
        signupErrors.value.confirmPassword =
          "Potwierdzenie hasła jest wymagane.";
      } else if (
        signupForm.value.password !== signupForm.value.confirmPassword
      ) {
        signupErrors.value.confirmPassword = "Hasła nie są identyczne.";
      } else {
        signupErrors.value.confirmPassword = "";
      }
    };

    const isSignupFormValid = () => {
      validateEmail();
      validatePassword();
      validateConfirmPassword();
      return (
        !signupErrors.value.email &&
        !signupErrors.value.password &&
        !signupErrors.value.confirmPassword
      );
    };


    const handleLogin = async () => {
      authError.value = null;
      isLoading.value = true;
      try {
        await store.dispatch("login", loginForm.value);
        // --- 3. Dodane przekierowanie ---
        router.push({ name: 'welcome' });
      } catch (error: any) {
        authError.value = "Nie udało się zalogować. Sprawdź email i hasło.";
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
            email: signupForm.value.email,
            password: signupForm.value.password,
          });
          // --- 4. Dodane przekierowanie ---
          router.push({ name: 'welcome' });
        } catch (error: any) {
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
      validateEmail,
      validatePassword,
      validateConfirmPassword,
    };
  },
});
</script>