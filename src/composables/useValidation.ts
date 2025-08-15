// src/composables/useValidation.ts
import { ref, reactive } from "vue";

// Definiujemy kształt obiektu formularza
interface SignupForm {
  email: string;
  password: string;
  confirmPassword: string;
}

// Funkcja composable przyjmuje teraz reaktywny obiekt
export function useValidation(form: SignupForm) {
  const errors = ref({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email) {
      errors.value.email = "Email jest wymagany.";
    } else if (!emailRegex.test(form.email)) {
      errors.value.email = "Niepoprawny format email.";
    } else {
      errors.value.email = "";
    }
  };

  const validatePassword = () => {
    if (!form.password) {
      errors.value.password = "Hasło jest wymagane.";
    } else if (form.password.length < 6) {
      errors.value.password = "Hasło musi mieć co najmniej 6 znaków.";
    } else {
      errors.value.password = "";
    }
    validateConfirmPassword();
  };

  const validateConfirmPassword = () => {
    if (!form.confirmPassword) {
      errors.value.confirmPassword = "Potwierdzenie hasła jest wymagane.";
    } else if (form.password !== form.confirmPassword) {
      errors.value.confirmPassword = "Hasła nie są identyczne.";
    } else {
      errors.value.confirmPassword = "";
    }
  };

  const isFormValid = () => {
    validateEmail();
    validatePassword();
    validateConfirmPassword();
    return (
      !errors.value.email &&
      !errors.value.password &&
      !errors.value.confirmPassword
    );
  };

  return {
    signupErrors: errors,
    validateEmail,
    validatePassword,
    validateConfirmPassword,
    isSignupFormValid: isFormValid,
  };
}
