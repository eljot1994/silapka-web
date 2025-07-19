import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Twoja konfiguracja aplikacji Firebase
// Dane do wklejenia znajdziesz w konsoli Firebase po utworzeniu projektu
const firebaseConfig = {
  apiKey: "AIzaSyCIJmls9sIHibgQpb9sIklfnaWHT3y6Kvc",
  authDomain: "silapka-web.firebaseapp.com",
  projectId: "silapka-web",
  storageBucket: "silapka-web.firebasestorage.app",
  messagingSenderId: "416321142424",
  appId: "1:416321142424:web:dc3f927711fe026b89daed",
  measurementId: "G-8GJY2Y4XH5",
};

// Inicjalizacja Firebase
const app = initializeApp(firebaseConfig);

// Inicjalizacja usług
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
