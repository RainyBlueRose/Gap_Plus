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
  apiKey: "AIzaSyBK3c5kRtnLQSwdOmnyU587hviQ6SlJSNk",
  authDomain: "gapplussandbox.firebaseapp.com",
  projectId: "gapplussandbox",
  storageBucket: "gapplussandbox.firebasestorage.app",
  messagingSenderId: "664123457962",
  appId: "1:664123457962:web:0925ab17a52ce89952abd3",
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
