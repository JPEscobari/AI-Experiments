import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  const [inputText, setInputText] = useState('');
  const [tokenizedResult, setTokenizedResult] = useState(null);
  const [translatedText, setTranslatedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTokenize = async () => {
   
    if (!inputText.trim()) {
      setError('Please enter some Chinese text');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:5000/api/tokenize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputText }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      setTokenizedResult(data);
    } catch (err) {
      setError('Failed to tokenize text. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      setError('Please enter some Chinese text');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:5000/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputText }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      setTranslatedText(data.translation_text);
    } catch (err) {
      setError('Failed to translate text. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Chinese Text Processor</h1>
      
      <div className="mb-4">
        <label htmlFor="chineseText" className="form-label">Enter Chinese Text:</label>
        <textarea
          id="chineseText"
          className="form-control"
          rows="4"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter Chinese text here..."
        />
      </div>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="d-flex gap-2 mb-4">
        <button 
          className="btn btn-primary" 
          onClick={handleTokenize}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Tokenize Text'}
        </button>
        
        <button 
          className="btn btn-success" 
          onClick={handleTranslate}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Translate to English'}
        </button>
      </div>
      
      {tokenizedResult && (
        <div className="card mb-4">
          <div className="card-header">Tokenization Result</div>
          <div className="card-body">
            <h5>Tokens:</h5>
            <pre className="bg-light p-3 rounded">
              {JSON.stringify(tokenizedResult.tokens, null, 2)}
            </pre>
            
            <h5>Token IDs:</h5>
            <pre className="bg-light p-3 rounded">
              {JSON.stringify(tokenizedResult.ids, null, 2)}
            </pre>
          </div>
        </div>
      )}
      
      {translatedText && (
        <div className="card">
          <div className="card-header">Translation Result</div>
          <div className="card-body">
            <h5>English Translation:</h5>
            <p className="lead">{translatedText}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;