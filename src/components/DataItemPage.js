import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mem0Data } from '../data';
import './DataItemPage.css';
import StructuredContent from './StructuredContent';

const DataItemPage = () => {
  const { id } = useParams();
  
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Get the data
  const item = mem0Data.find(item => item.id === parseInt(id));

  // Cleanup speech synthesis on component unmount
  useEffect(() => {
    return () => {
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }
    };
  }, []);

  const handleTTS = () => {
    if (!item || !item.content) return;

    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(item.content);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  if (!item) {
    return (
      <div className="data-item-page">
        <div className="data-item-container">
          <div className="terminal-breadcrumb">
            <Link to="/" className="breadcrumb-link">database</Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">error_404</span>
          </div>
          <div className="data-item-header">
            <h1>Entry Not Found</h1>
          </div>
          <div className="data-item-content">
            <p>The requested database entry could not be found.</p>
            <Link to="/" className="back-link">← Back to Database</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="data-item-page">
      <div className="data-item-container">
        <div className="terminal-breadcrumb">
          <Link to="/" className="breadcrumb-link">database</Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">entry_{item.id}</span>
          <span className="breadcrumb-timestamp">[{new Date().toISOString().slice(0, 19).replace('T', ' ')}]</span>
        </div>
        <div className="data-item-header">
          <h1 className="data-item-title">{item.title}</h1>
          <div className="data-item-controls">
            <button 
              className={`tts-button ${isSpeaking ? 'speaking' : ''}`}
              onClick={handleTTS}
              aria-label={isSpeaking ? "Stop reading" : "Read aloud"}
            >
              {isSpeaking ? '⏹' : '🔊'}
            </button>
            <div className="data-item-status">
              <span className="status-dot online"></span>
              <span className="status-text">ACTIVE</span>
            </div>
          </div>
        </div>
        <div className="data-item-content">
          <div className="data-item-meta">
            <span className="data-item-type">{item.type}</span>
            <span className="data-item-date">{item.date}</span>
            <span className="data-item-id">ID: {item.id}</span>
            <span className="data-item-size">SIZE: {item.content ? `${Math.ceil(item.content.length / 1024)} KB` : '0 KB'}</span>
          </div>
          <StructuredContent content={item.content} />
          <Link to="/" className="back-link">← Back to Database</Link>
        </div>
      </div>
    </div>
  );
};

export default DataItemPage; 