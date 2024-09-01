const express = require("express");
require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Function to convert base64 string to a generative part for the API
function base64ToGenerativePart(base64Data, mimeType) {
  return {
    inlineData: {
      data: base64Data,
      mimeType,
    },
  };
}

app.post("/ocr-detect", async (req, res) => {
  try {
    const { base64Data } = req.body; // Get base64 image data from request body
    const mimeType = "image/jpeg"; // Adjust if the image format is different

    const prompt =
      "return me a json which has the key and value pair as the dish name and the price of it. if there is tax, or any service charge, also write that as a key value pair with the total amount of tax amount as value. do not write anything else, just return me the json";

    // Convert base64 data to a generative part
    const imagePart = base64ToGenerativePart(base64Data, mimeType);

    // Generate content using the prompt and image
    const result = await model.generateContent([prompt, imagePart]);

    // Send the generated text as the response
    res.send({ message: result.response.text() });
  } catch (error) {
    console.error("Error generating text:", error);
    res.status(500).send({ error: "Error generating text from image." });
  }
});

// Listening to server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});






// {
//     "message": "{\"Tandooni chicken\": \"309.75\", \"Lasooni Dal Tadka\": \"298.75\", \"HYDERABADI MURG BIRYANI\": \"393.75\", \"Tandoori Roti all food\": \"63.00\", \"less spicy\": \"31.50\", \"Tandoori Roti\": \"30.00\", \"CGST@2.5\": \"25.89\", \"SGST@2.5\": \"25.89\", \"S.Tax\": \"51.75\", \"Total\": \"1,139.00\"}"
// }