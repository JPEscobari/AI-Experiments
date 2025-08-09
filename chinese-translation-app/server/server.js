const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const { HfInference } = require('@huggingface/inference');

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// Log each request to the console
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Initialize Hugging Face Inference
const hf = new HfInference(process.env.HUGGING_FACE_API_KEY);

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// Routes
app.post('/api/tokenize', async (req, res) => {
    try {
        const { text } = req.body;
        
        if(!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        // Using direct fetch to Hugging Face API for tokenization
        const response = await fetch(
            "https://api-inference.huggingface.co/models/bert-base-chinese",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.HUGGING_FACE_API_KEY}`
                },
                body: JSON.stringify({ inputs: text }),
            }
        );
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const result = await response.json();
        
        // Format the response to match what the client expects
        const formattedResult = {
            tokens: result[0].map(token => token.word),
            ids: result[0].map(token => token.id)
        };
        
        res.json(formattedResult);
    } catch (error) {
        console.error('Tokenization error:', error);
        res.status(500).json({ error: 'Failed to Tokenize Text' });
    }
});

app.post('/api/translate', async (req, res) => {
    try {
        const { text } = req.body;

        if(!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        // Using direct fetch to Hugging Face API for translation
        const response = await fetch(
            "https://api-inference.huggingface.co/models/Helsinki-NLP/opus-mt-zh-en",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.HUGGING_FACE_API_KEY}`
                },
                body: JSON.stringify({ inputs: text }),
            }
        );
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const result = await response.json();
        
        // Format the response to match what the client expects
        res.json({ translation_text: result[0].translation_text });
    } catch (error) {
        console.error('Translation error:', error);
        res.status(500).json({ error: 'Failed to Translate Text' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});