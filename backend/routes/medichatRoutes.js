// routes/medichatRoutes.mjs
import express from "express";
import { app as cragApp } from "../graph.js";

const router = express.Router();

router.post("/medi-chat", async (req, res) => {
  try {
    const { question, medicalRecordsText } = req.body;

    // The initial CRAG state
    const initialState = {
      question,
      medicalRecordsText,
      documents: [],
      generation: "",
    };

    // Get the async iterator
    const stateStream = await cragApp.stream(initialState, {
      recursionLimit: 10,
    });
    let finalState;

    // Iterate over the stream to capture the last partial state
    for await (const partialState of stateStream) {
      finalState = partialState;
    }

    // finalState should now hold the "final" result of the CRAG pipeline
    console.log("Final CRAG state:", finalState);

    // Return the final answer
    return res.json({ answer: finalState.generate.generation });
  } catch (err) {
    console.error("CRAG error:", err);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;
