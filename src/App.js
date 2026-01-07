import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import HomePage from './components/HomePage';
import DataItemPage from './components/DataItemPage';
import IntroScreen from './components/IntroScreen';
import { ThemeProvider } from './context/ThemeContext';

const AppContent = () => {
  const [showIntro, setShowIntro] = useState(true);
  
  // Check if the user has already seen the intro
  useEffect(() => {
    const hasSeenIntro = localStorage.getItem('hasSeenIntro');
    if (hasSeenIntro) {
      setShowIntro(false);
    }
  }, []);
  
  const handleIntroComplete = () => {
    setShowIntro(false);
    localStorage.setItem('hasSeenIntro', 'true');
  };
  
  return (
    <>
      {showIntro ? (
        <IntroScreen onIntroComplete={handleIntroComplete} />
      ) : (
        <div className="App">
          <header className="terminal-header">
            <div className="terminal-logo">mem0<span className="cursor"></span></div>
          </header>
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/database/:id" element={<DataItemPage />} />
            </Routes>
          </main>
        </div>
      )}
    </>
  );
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;
