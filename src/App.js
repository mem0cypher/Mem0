import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import './App.css';
import HomePage from './components/HomePage';
import DataItemPage from './components/DataItemPage';
import AudioPlayer from './components/AudioPlayer';
import IntroScreen from './components/IntroScreen';
import { ThemeProvider, useTheme } from './context/ThemeContext';

const AppContent = () => {
  const { theme } = useTheme();
  const location = useLocation();
  const [showIntro, setShowIntro] = useState(true);
  const audioPlayerRef = useRef(null);
  
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
  
  // Hide theme switcher when viewing a database item
  const isDataItemPage = location.pathname.includes('/database/');
  
  // Always include the AudioPlayer, but only show controls when intro is done
  return (
    <>
      <AudioPlayer 
        showControls={!showIntro} 
        ref={audioPlayerRef}
        forceAutoplay={showIntro} 
      />
      
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
