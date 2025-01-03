/* eslint-disable no-restricted-globals */
// 1) Load the Firebase scripts for "compat"
//    since service workers can't do normal imports easily
importScripts(
  "https://www.gstatic.com/firebasejs/9.15.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.15.0/firebase-messaging-compat.js"
);

// 2) Initialize Firebase in the service worker
//    Replicate your config or store it in environment variables
firebase.initializeApp({
  apiKey: "AIzaSyC_uaf-p6buGj3HQfUHjZurGRN_--oneiY",
  authDomain: "qrbell-c12da.firebaseapp.com",
  projectId: "qrbell-c12da",
  storageBucket: "qrbell-c12da.firebasestorage.app",
  messagingSenderId: "51200353503",
  appId: "1:51200353503:web:d8a84d5ab45979461c756a",
  measurementId: "G-LMMS1BVC3R", // optional
});

// 3) Retrieve an instance of Firebase Messaging so we can handle background messages
const messaging = firebase.messaging();

// 4) Define how to handle background (and possibly "terminated") push notifications
messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message",
    payload
  );

  const notificationTitle = payload?.notification?.title || "Medicine Reminder";
  const notificationOptions = {
    body: payload?.notification?.body || "You have a new message.",
    icon: "/icon.png", // a public icon in your /public folder
  };

  // Show the user a notification
  self.registration.showNotification(notificationTitle, notificationOptions);
});
