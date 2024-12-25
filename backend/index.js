// src/index.js
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
require("dotenv").config();
const supabase = require("./supabase");

// Initialize Firebase Admin
const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// Middleware to verify Firebase token
const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split("Bearer ")[1];
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// Register new user
app.post("/api/auth/register", async (req, res) => {
  try {
    const { uid, email, name } = req.body;

    // Update user profile in Firebase
    await admin.auth().updateUser(uid, {
      displayName: name,
    });

    // Now save the user to Supabase
    const { data, error } = await supabase
      .from("users")
      .insert([{ uid, email, name }]);

    if (error) {
      console.error("Supabase insert error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json({ message: "User registered successfully", data });
    console.log("User registered successfully in Supabase");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Google sign-in handler
app.post("/api/auth/google", async (req, res) => {
  try {
    const { uid, email, name } = req.body;
    console.log("Google sign-in successful");
    console.log(uid, email, name);

    const { data, error } = await supabase
      .from("users")
      // upsert will update if the uid already exists, or create a new one if not
      .upsert([{ uid, email, name }], {
        onConflict: "uid", // column to check for duplicates
      });

    if (error) {
      console.error("Supabase upsert error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json({ message: "Google sign-in successful" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Protected route example
app.get("/api/protected", authenticateUser, (req, res) => {
  res.json({ message: "This is a protected route", user: req.user });
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
