// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBM-mbbvUJO9iOKmIcqD2zAIulnWfmUfZU",
  authDomain: "gap-learning-plan.firebaseapp.com",
  projectId: "gap-learning-plan",
  storageBucket: "gap-learning-plan.firebasestorage.app",
  messagingSenderId: "1068192174083",
  appId: "1:1068192174083:web:cec4e9a90e0621b4f7fe36",
  measurementId: "G-Q4CXEL7C17",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});
export const storage = getStorage(app);
