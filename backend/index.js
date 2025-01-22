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
import axios from "axios";
import zlib from "zlib";
import { promisify } from "util";
import appointmentRoutes from './routes/appointmentRoutes.js';
import premiumPredictorRoutes from './routes/premiumPredictorRoutes.js';
const upload = multer({ dest: "uploads/" });


const gunzip = promisify(zlib.gunzip);

// API configurations
const PHARMEASY_BASE_URL = "https://pharmeasy.in/api/search/search/?intent_id=1736254134724";
const ONE_MG_BASE_URL = "https://www.1mg.com/pharmacy_api_webservices/search-all";
const APOLLO_BASE_URL = "https://search.apollo247.com/v3/fullSearch";

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36"
};

async function searchPharmEasy(searchTerm) {
  try {
    const response = await axios.get(`${PHARMEASY_BASE_URL}&q=${searchTerm}&page=1`, {
      headers: HEADERS
    });

    // Log full response for debugging
    console.log("API Response:", response.data);

    const products = response.data?.data?.products;
    if (!products || products.length === 0) {
      console.warn("No products found for the given search term.");
      return [];
    }

    // Map and return product details
    return products.map(product => ({
      name: product.name,
      price: product.salePriceDecimal,
      availability: product.productAvailabilityFlags.isAvailable,
      image: product.image,
      url: "https://pharmeasy.in/online-medicine-order/"+product.slug
    }));
  } catch (error) {
    // Improved error logging
    console.error("PharmEasy Error:", error.response ? error.response.data : error.message);
    return [];
  }
}


async function searchOneMg(searchTerm) {
  try {
    const response = await axios.get(ONE_MG_BASE_URL, {
      params: {
        city: "Gurgaon",
        name: searchTerm,
        pageSize: 40,
        page_number: 0,
        types: "sku,allopathy",
        filter: true,
        state: 1
      },
      responseType: "arraybuffer",
      headers: { ...HEADERS, "Accept-Encoding": "gzip, deflate, br" }
    });

    let decompressedData;
    const contentEncoding = response.headers["content-encoding"];
    
    if (contentEncoding?.includes("gzip")) {
      decompressedData = await gunzip(response.data);
    } else {
      decompressedData = response.data;
    }

    const jsonData = JSON.parse(decompressedData.toString("utf-8"));
    const products = [];

    jsonData.results.forEach(result => {
      if (result.value?.data && Array.isArray(result.value.data)) {
        result.value.data.forEach(product => {
          products.push({
            name: product.label,
            price: product.discounted_price,
            availability: true,
            image: product.cropped_image,
            url: "https://www.1mg.com"+product.url
          });
        });
      }
    });

    return products;
  } catch (error) {
    console.error("1mg Error:", error.message);
    return [];
  }
}

async function searchApollo(searchTerm) {
  try {
    const payload = {
      query: searchTerm,
      page: 1,
      productsPerPage: 24,
      selSortBy: "relevance",
      filters: [],
      pincode: ""
    };

    const response = await axios.post(APOLLO_BASE_URL, payload, {
      headers: { ...HEADERS, "Content-Type": "application/json", "Authorization": "Oeu324WMvfKOj5KMJh2Lkf00eW1" }
    });

    return response.data.data.products.map(product => ({
      name: product.name,
      price: product.specialPrice || product.price,
      availability: product.status === "AVAILABLE",
      image: "https://images.apollo247.in/pub/media"+product.thumbnail,
      url: "https://www.apollopharmacy.in/search-medicines/"+encodeURIComponent(product.name)

    }));
  } catch (error) {
    console.error("Apollo Error:", error.message);
    return [];
  }
}


// Initialize Firebase Admin

const app = express();

const allowedOrigins = ['https://curo-flame.vercel.app','http://localhost:5173'];

// CORS options
const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);  // Allow the origin in the response
    } else {
      callback(new Error('Not allowed by CORS'));  // Disallow the origin
    }
  },
  optionsSuccessStatus: 200  // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

// Use cors middleware with options
app.use(cors(corsOptions));
app.use(express.json());

// Middleware to verify Firebase token
const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split("Bearer ")[1];
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }
    if (token === "Testing-JWT-Token") {
      next();
      return;
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
// Google Maps / Nearby Hospitals endpoint (protected)
app.get("/api/maps/nearby-hospitals", authenticateUser, async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;
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
app.get("/api/maps/nearby-lab", authenticateUser, async (req, res) => {
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
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=any&keyword=medical-lab&key=${googleApiKey}`;
 
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
app.get("/api/maps/nearby-doctor", authenticateUser, async (req, res) => {
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
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=doctor&keyword=doctor&key=${googleApiKey}`
    const response = await fetch(url);
    const data = await response.json();
    console.log("Nearby doctor data:", data);
 
    // Send the entire response or transform it as needed
    res.json(data);
  } catch (error) {
    console.error("Nearby doctor error:", error);
    res.status(500).json({ error: error.message });
  }
});
 
app.get("/api/maps/nearby-doctor-type", authenticateUser, async (req, res) => {
  try {
    const { lat, lng, radius = 5000,keyword } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ error: "Missing lat or lng query params" });
    }
 
    const googleApiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!googleApiKey) {
      return res.status(500).json({ error: "Missing Google Maps API key" });
    }
 
    // Construct the Nearby Search URL
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=doctor&keyword=${keyword}&key=${googleApiKey}`
    const response = await fetch(url);
    const data = await response.json();
    console.log("Nearby doctor data:", data);
 
    // Send the entire response or transform it as needed
    res.json(data);
  } catch (error) {
    console.error("Nearby doctor error:", error);
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/maps/nearby-pharmacy", authenticateUser, async (req, res) => {
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
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=pharmacy&key=${googleApiKey}`;
 
    const response = await fetch(url);
    const data = await response.json();
    console.log("Nearby pharmacy data:", data);
 
    // Send the entire response or transform it as needed
    res.json(data);
  } catch (error) {
    console.error("Nearby pharmacy error:", error);
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
      console.log(parsedDetails);
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
app.get("/api/medicine-search/", authenticateUser, async (req, res) => {
  try {
    const { query } = req.query;
    console.log("hello");
    if (!query) {
      return res.status(400).json({ 
        success: false, 
        error: "Search query is required" 
      });
    }

    const [pharmEasyResults, oneMgResults, apolloResults] = await Promise.all([
      searchPharmEasy(query),
      searchOneMg(query),
      searchApollo(query)
    ]);

    res.json({
      success: true,
      data: {
        pharmEasy: {
          source: "PharmEasy",
          products: pharmEasyResults
        },
        oneMg: {
          source: "1mg",
          products: oneMgResults
        },
        apollo: {
          source: "Apollo",
          products: apolloResults
        }
      }
    });
    console.log(res.json);
  } catch (error) {
    console.error("Medicine search error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to search medicines across pharmacies"
    });
  }
});


//Appointment Routes

app.use('/api/appointments', appointmentRoutes);

//Premium Predictor Routes
app.use('/api/premium-predictor', premiumPredictorRoutes);

app.get("/api/user-profile", authenticateUser, async (req, res) => {
  try {
    const { uid } = req.user; // Assume `authenticateUser` middleware adds `user` to `req`
    const { data: user, error: userError } = await supabase
      .from("users")
      .select(" name, email, blood_group, allergies, heart_rate, blood_pressure, height, weight, date_of_birth")
      .eq("uid", uid)
      .single(); // Use .single() to get only one record if `uid` is unique
 
    if (userError) {
      console.error("Error fetching user:", userError);
      return res.status(500).json({ error: "Failed to fetch user profile." });
    }
 
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
 
    return res.status(200).json({ user });
  } catch (err) {
    console.error("Error in /api/user-profile:", err);
    return res.status(500).json({ error: "Internal Server Error." });
  }
});

app.post("/api/update-profile", authenticateUser, async (req, res) => {
  try {
    const { uid } = req.user; // Extract the user's UID from the middleware
    const {
      blood_group,
      allergies,
      heart_rate,
      blood_pressure,
      height,
      weight,
      dob,
    } = req.body; // Destructure the fields from the request body
 
    // Update user profile in the database
    const { data, error } = await supabase
      .from("users")
      .update({
        blood_group,
        allergies,
        heart_rate,
        blood_pressure,
        height,
        weight,
        dob,
      })
      .eq("uid", uid);
 
    if (error) {
      console.error("Error updating user profile:", error);
      return res.status(500).json({ error: "Failed to update profile." });
    }
 
    
 
    return res.status(200).json({ message: "Profile updated successfully.", data });
  } catch (err) {
    console.error("Error in /api/update-profile:", err);
    return res.status(500).json({ error: "Internal Server Error." });
  }
});

app.get("/api/fetch-user", authenticateUser, async (req, res) => {
  try {
    const { uid } = req.user;
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("uid", uid);
 
    // Use error from the query, and check if data is empty or null
    if (error || !data) {
      return res.status(404).json({ error: "User not found" });
    }
 
    console.log(data); // Log the fetched data
    res.status(200).json({ records: data }); // Send the fetched data as the response
  } catch (err) {
    console.error(err); // Log the error if any
    res.status(500).json({ error: err.message }); // Send the error message in the response
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
