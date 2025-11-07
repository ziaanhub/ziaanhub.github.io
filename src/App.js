import React, { useState } from 'react';
import './App.css';

function App() {
  const [copied, setCopied] = useState(false);
  const textToCopy = 'loadstring(game:HttpGet("https://ziaanhub.github.io/ziaanhub.lua"))()';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };

  const downloadText = () => {
    const element = document.createElement('a');
    const file = new Blob([textToCopy], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'script.lua';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="App">
      <div className="card">
        <div className="card-content">
          <h2>Script Loader</h2>
          <div className="text-container">
            <code>{textToCopy}</code>
          </div>
          <div className="button-container">
            <button 
              className={`copy-button ${copied ? 'copied' : ''}`}
              onClick={copyToClipboard}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button className="download-button" onClick={downloadText}>
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
