// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC_uaf-p6buGj3HQfUHjZurGRN_--oneiY",
  authDomain: "qrbell-c12da.firebaseapp.com",
  projectId: "qrbell-c12da",
  storageBucket: "qrbell-c12da.firebasestorage.app",
  messagingSenderId: "51200353503",
  appId: "1:51200353503:web:d8a84d5ab45979461c756a",
  measurementId: "G-LMMS1BVC3R",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
