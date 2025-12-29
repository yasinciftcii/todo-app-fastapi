// frontend/lib/firebase.ts

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDaBNRNrAb7ebgrcYJdfdBOpIvMOjarYKg",
    authDomain: "todo-app-8c678.firebaseapp.com",
    projectId: "todo-app-8c678",
    storageBucket: "todo-app-8c678.firebasestorage.app",
    messagingSenderId: "796612796366",
    appId: "1:796612796366:web:b473c131475a649ea1959f",
    measurementId: "G-9YVWS33L3B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth servisi (Sunucuda ve istemcide çalışabilir)
export const auth = getAuth(app);

// Analytics SADECE tarayıcı ortamında (Client-Side) başlatılır
// Bu kontrol "ReferenceError: window is not defined" hatasını çözer
let analytics;
if (typeof window !== "undefined") {
    analytics = getAnalytics(app);
}

export { analytics };