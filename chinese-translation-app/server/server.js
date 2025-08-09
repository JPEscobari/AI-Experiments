const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file in the server directory
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Translation endpoint
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
            const errorText = await response.text();
            console.log('Error response body:', errorText);
            throw new Error(`HTTP error! Status: ${response.status}, Body: ${errorText}`);
        }
        
        const result = await response.json();
        console.log('Translation result:', result);
        
        // Format the response to match what the client expects
        res.json({ translation_text: result[0].translation_text });
    } catch (error) {
        console.error('Translation error:', error);
        res.status(500).json({ error: 'Failed to Translate Text' });
    }
});

// Tokenization endpoint - Fixed for sentence transformers
app.post('/api/tokenize', async (req, res) => {
    try {
        const { text } = req.body;

        if(!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        // Try sentence transformer with correct format
        try {
            
            const response = await fetch(
                "https://api-inference.huggingface.co/models/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${process.env.HUGGING_FACE_API_KEY}`
                    },
                    body: JSON.stringify({ 
                        inputs: {
                            "source_sentence": text,
                            "sentences": [text, "Hello", "你好"]
                        },
                        options: {
                            wait_for_model: true
                        }
                    }),
                }
            );

            if (response.ok) {
                const result = await response.json();
                return res.json({ 
                    model: "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
                    task: "sentence-similarity",
                    input: text,
                    result: result,
                    success: true
                });
            } else {
                const errorText = await response.text();
                console.log('Sentence transformer error:', errorText);
            }
        } catch (error) {
            console.log('Sentence transformer failed:', error.message);
        }

        return res.status(500).json({ 
            error: 'No suitable tokenization method found',
            message: 'Consider using different NLP tasks that are supported by Inference API'
        });

    } catch (error) {
        console.error('Tokenization error:', error);
        res.status(500).json({ error: 'Failed to tokenize text' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});