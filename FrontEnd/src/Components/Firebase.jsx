// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import{getAuth} from "firebase/auth"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAEt7VQILgSbpzgLb5jK24ktDsjeRMYsQY",
  authDomain: "login-auth-d2b8a.firebaseapp.com",
  projectId: "login-auth-d2b8a",
  storageBucket: "login-auth-d2b8a.firebasestorage.app",
  messagingSenderId: "716475592035",
  appId: "1:716475592035:web:66331082d9ccfda672f756"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth=getAuth();
export default app;