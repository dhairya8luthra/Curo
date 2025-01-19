// router.js (or your file name)
import express from 'express';
import bodyParser from 'body-parser';
import * as ort from 'onnxruntime-node';
import { authenticateUser } from '../middleware/auth.js';


const router = express.Router();

let scalerSession;
let modelSession;

// Asynchronous function to load the ONNX model sessions.
async function initializeModels() {
  try {
    // Load the scaler ONNX model (for preprocessing)
    scalerSession = await ort.InferenceSession.create('./MachineLearningModel/scaler.onnx');
    console.log('Scaler model loaded.');
    console.log('Scaler model input names:', scalerSession.inputNames);

    // Load the prediction (LightGBM) ONNX model
    modelSession = await ort.InferenceSession.create('./MachineLearningModel/model.onnx');
    console.log('Prediction model loaded.');
    console.log('Prediction model input names:', modelSession.inputNames);
  } catch (error) {
    console.error('Error loading ONNX models:', error);
  }
}

// Use top-level await if your Node version supports it.
await initializeModels();

router.post('/predict', authenticateUser, async (req, res) => {
  try {
    // Expect the client to send a JSON payload like:
    // { "features": [Age, Diabetes, BloodPressureProblems, AnyTransplants, AnyChronicDiseases,
    //                Height, Weight, KnownAllergies, HistoryOfCancerInFamily, NumberOfMajorSurgeries] }
    const features = req.body.features;

    // Validate the input – it should be an array of 10 numeric values.
    if (!features || !Array.isArray(features) || features.length !== 10) {
        console.log("the features are:",features);
      return res.status(400).json({ error: 'Please provide an array of 10 numeric features.' });
    }

    // Convert the feature array to a Float32Array and create a tensor of shape [1, 10].
    const inputTensor = new ort.Tensor('float32', Float32Array.from(features), [1, 10]);

    // Run the scaler ONNX model for preprocessing.
    // Adjust the input name ('input') if your ONNX model uses a different name.
    const scalerFeeds = { input: inputTensor };
    console.log(scalerFeeds);
    const scalerResults = await scalerSession.run(scalerFeeds);

    // Assume the scaler output is stored under the key "output" (adjust if needed).
    const processedInput = scalerResults.variable;
    console.log("Scaler output (raw):", processedInput);

    // Deep-clone the tensor’s data by copying each element.
    const clonedData = new Float32Array(processedInput.cpuData.length);
    for (let i = 0; i < processedInput.cpuData.length; i++) {
    clonedData[i] = processedInput.cpuData[i];
    }

    // Now create a fresh tensor.
    const processedInputTensor = new ort.Tensor(
    processedInput.type,
    clonedData,
    [1,10]
    );

// Verify it is an instance of ort.Tensor.
console.log("Processed tensor for prediction:", processedInputTensor);
console.log("Is instance of ort.Tensor?", processedInputTensor instanceof ort.Tensor);
    // Run the prediction model using the processed input.
    const modelFeeds = { input: processedInput };
    const modelResults = await modelSession.run(modelFeeds);

    // Retrieve the prediction from the output (adjust the key if necessary).
    let prediction;
    if (modelResults.prediction) {
      prediction = modelResults.prediction.data[0];
    } else {
      // If the key is unknown, simply take the first output.
      prediction = modelResults[Object.keys(modelResults)[0]].data[0];
    }

    // Respond with the prediction.
    console.log('Prediction:', prediction);
    res.json({ prediction: Number(prediction) });
  } catch (error) {
    console.error('Error during inference:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
