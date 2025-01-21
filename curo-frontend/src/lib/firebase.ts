// lib/firebase.ts

// Import the functions you need from the SDKs you want
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getMessaging } from "firebase/messaging"; // <-- For FCM

// Your web app's Firebase configuration
// (read from Vite environment variables with `import.meta.env`)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: "G-LMMS1BVC3R", // optional
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics (only works if you run in a browser environment)


// Export Firebase Auth instance
export const auth = getAuth(app);

// Export Firebase Messaging instance
export const messaging = getMessaging(app);

/**
 * Explanation / Usage:
 *
 * 1. `auth`: Use for Firebase Authentication.
 *    - Example: `const user = await signInWithEmailAndPassword(auth, email, password);`
 *
 * 2. `messaging`: Use to set up Cloud Messaging in your React app.
 *    - Example: In a React component, import { messaging } from "lib/firebase";
 *      request permission, then call:
 *
 *        import { getToken } from "firebase/messaging";
 *
 *        const fcmToken = await getToken(messaging, { vapidKey: "<Your Public Vapid Key>" });
 *        // Then send that token to your backend / Supabase to save it for push notifications.
 *
 * 3. `analytics`: Tracks page views, events, etc. in Firebase Analytics
 *    - Example usage is optional. You can remove if not using Analytics.
 */
