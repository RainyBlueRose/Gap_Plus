// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAGkkUrl6VNZ-7tyIstgJiTZgW3TxdPu5E",
  authDomain: "sandbox-testing-82d6c.firebaseapp.com",
  projectId: "sandbox-testing-82d6c",
  storageBucket: "sandbox-testing-82d6c.firebasestorage.app",
  messagingSenderId: "145357779432",
  appId: "1:145357779432:web:a2bdc6d988ef27b789745d",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();
