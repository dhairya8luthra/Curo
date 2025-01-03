// firebaseAdmin.js
import admin from "firebase-admin";
import serviceAccount from "./serviceAccountKey.json" assert { type: "json" };
// your private service account JSON

// Initialize the Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // optionally set a databaseURL if you're using Realtime Database
  // databaseURL: "https://<YOUR_PROJECT_ID>.firebaseio.com",
});

export default admin;
