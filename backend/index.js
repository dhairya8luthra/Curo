import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import supabase from "./supabase.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import chatRoutes from "./routes/medichatRoutes.js";
import "./scheduler/reminderScheduler.js";
import admin from "./firebaseAdmin.js";
// Multer configuration for file uploads
const upload = multer({ dest: "uploads/" });

// Initialize Firebase Admin

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

    res
      .status(200)
      .json({ message: "User registered successfully", data: req.body });
    console.log("User registered successfully in Supabase");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.put("/api/users/update-fcm-token", authenticateUser, async (req, res) => {
  try {
    const { uid } = req.user;
    const { fcmToken } = req.body;

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("uid", uid)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { error: updateError } = await supabase
      .from("users")
      .update({ fcm_token: fcmToken })
      .eq("id", user.id);

    if (updateError) {
      return res.status(500).json({ error: updateError.message });
    }

    res.status(200).json({ message: "FCM token updated successfully" });
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

// Google Maps / Nearby Hospitals endpoint (protected)
app.get("/api/maps/nearby-hospitals", authenticateUser, async (req, res) => {
  try {
    const { lat, lng, radius = 5000 } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ error: "Missing lat or lng query params" });
    }

    const googleApiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!googleApiKey) {
      return res.status(500).json({ error: "Missing Google Maps API key" });
    }

    // Construct the Nearby Search URL
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=hospital&key=${googleApiKey}`;

    const response = await fetch(url);
    const data = await response.json();
    console.log("Nearby hospitals data:", data);

    // Send the entire response or transform it as needed
    res.json(data);
  } catch (error) {
    console.error("Nearby hospitals error:", error);
    res.status(500).json({ error: error.message });
  }
});
// Add health record
app.post(
  "/api/health-records",
  authenticateUser,
  upload.single("file"), // Multer handles file upload
  async (req, res) => {
    try {
      const { type, details } = req.body; // req.body fields are populated here
      const { uid } = req.user;
      const file = req.file;

      if (!type || !details) {
        return res
          .status(400)
          .json({ error: "Missing required fields: type or details" });
      }

      let parsedDetails;
      try {
        parsedDetails = JSON.parse(details); // Parse `details` as JSON
      } catch (error) {
        return res.status(400).json({ error: "Invalid JSON in details field" });
      }

      // Fetch user ID from Supabase
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("uid", uid)
        .single();

      if (userError || !user) {
        return res.status(404).json({ error: "User not found" });
      }

      let fileUrl = null;

      // If a file is uploaded, upload it to Supabase storage
      if (file) {
        const fileExt = path.extname(file.originalname);
        const fileName = `${Date.now()}-${file.originalname}`;
        const filePath = `health-records/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("health-records")
          .upload(filePath, fs.createReadStream(file.path), {
            contentType: file.mimetype,
            duplex: "half",
          });

        if (uploadError) {
          console.error("Supabase upload error:", uploadError);
          return res.status(500).json({ error: "Failed to upload file" });
        }

        fileUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/health-records/health-records/${fileName}`;
      }

      // Insert the record into Supabase
      const { data, error } = await supabase.from("health_records").insert({
        user_id: user.id,
        type,
        details: parsedDetails, // Use parsed JSON object
        uploaded_file_url: fileUrl,
      });

      if (error) {
        console.error("Supabase insert error:", error);
        return res.status(500).json({ error: "Failed to insert record" });
      }

      res.status(201).json({ message: "Record added successfully", data });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  }
);
// Fetch health records
app.get("/api/health-records", authenticateUser, async (req, res) => {
  try {
    const { uid } = req.user;

    // Fetch user ID from Supabase
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("uid", uid)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Fetch health records for the user
    const { data, error } = await supabase
      .from("health_records")
      .select("*")
      .eq("user_id", user.id);

    if (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to fetch records" });
    }

    res.status(200).json({ records: data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});
// Update health record

app.put("/api/health-records/:id", authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { uid } = req.user;
    const { type, details } = req.body;

    if (!type || !details) {
      return res
        .status(400)
        .json({ error: "Missing required fields: type or details" });
    }

    // Fetch user ID from Supabase
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("uid", uid)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update the record
    const { data, error } = await supabase
      .from("health_records")
      .update({ type, details })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error updating record:", error);
      return res.status(500).json({ error: "Failed to update record" });
    }

    res.status(200).json(req.body);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
});
// Delete health record
app.delete("/api/health-records/:id", authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { uid } = req.user;

    // Fetch user ID from Supabase
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("uid", uid)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Delete the record
    const { data, error } = await supabase
      .from("health_records")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting record:", error);
      return res.status(500).json({ error: "Failed to delete record" });
    }

    res.status(200).json({ message: "Record deleted successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
});
//Medichat Routes
app.use("/api", chatRoutes);

//Medicine Reminder Routes
// CREATE a new medicine reminder
app.post("/api/medicine-reminder", authenticateUser, async (req, res) => {
  try {
    const { uid } = req.user;
    const { name, dosage, time, days } = req.body;

    if (!name || !time || !days) {
      return res
        .status(400)
        .json({ error: "name, time, and days are required." });
    }

    // 1) find the user’s ID in supabase
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("uid", uid)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 2) insert the medicine reminder
    const { data, error } = await supabase
      .from("medicine_reminders")
      .insert({
        user_id: user.id,
        name,
        dosage,
        time,
        days, // must be an array e.g. ['Monday','Wednesday']
      })
      .single();

    if (error) {
      console.error("Error creating reminder:", error);
      return res.status(500).json({ error: "Failed to create reminder" });
    }

    res.status(201).json({ message: "Reminder created", reminder: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// READ: get all reminders for the authenticated user
app.get("/api/medicine-reminder", authenticateUser, async (req, res) => {
  try {
    const { uid } = req.user;

    // find user
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("uid", uid)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: "User not found" });
    }

    // get reminders for user
    const { data, error } = await supabase
      .from("medicine_reminders")
      .select("*")
      .eq("user_id", user.id);

    if (error) {
      console.error("Error fetching reminders:", error);
      return res.status(500).json({ error: "Failed to fetch reminders" });
    }

    res.status(200).json({ reminders: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// UPDATE: update a reminder
app.put("/api/medicine-reminder/:id", authenticateUser, async (req, res) => {
  try {
    const { uid } = req.user;
    const { id } = req.params;
    const { name, dosage, time, days } = req.body;

    // find user
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("uid", uid)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: "User not found" });
    }

    // update the record
    const { data, error } = await supabase
      .from("medicine_reminders")
      .update({ name, dosage, time, days })
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error("Error updating reminder:", error);
      return res.status(500).json({ error: "Failed to update reminder" });
    }

    res.status(200).json({ message: "Reminder updated", reminder: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE: delete a reminder
app.delete("/api/medicine-reminder/:id", authenticateUser, async (req, res) => {
  try {
    const { uid } = req.user;
    const { id } = req.params;

    // find user
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("uid", uid)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: "User not found" });
    }

    // delete the record
    const { data, error } = await supabase
      .from("medicine_reminders")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error("Error deleting reminder:", error);
      return res.status(500).json({ error: "Failed to delete reminder" });
    }

    res.status(200).json({ message: "Reminder deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
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
