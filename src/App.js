import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import './App.css';
import HomePage from './components/HomePage';
import DataItemPage from './components/DataItemPage';
import IntroScreen from './components/IntroScreen';
import VoidSimulation from './components/VoidSimulation';
import { ThemeProvider, useTheme } from './context/ThemeContext';

const AppContent = () => {
  const { theme } = useTheme();
  const location = useLocation();
  const [showIntro, setShowIntro] = useState(true);
  const [showVoid, setShowVoid] = useState(false);
  
  // Check if the user has already seen the intro
  useEffect(() => {
    const hasSeenIntro = localStorage.getItem('hasSeenIntro');
    if (hasSeenIntro) {
      setShowIntro(false);
    }
  }, []);
  
  // ESC key listener for void simulation
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'Escape') {
        setShowVoid(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);
  
  const handleIntroComplete = () => {
    setShowIntro(false);
    localStorage.setItem('hasSeenIntro', 'true');
  };

  const handleVoidObjectClick = (objectType) => {
    console.log('Void object clicked:', objectType);
    // Handle different object interactions here
    switch(objectType) {
      case 'portfolio':
        setShowVoid(false);
        // Navigate to portfolio section
        break;
      case 'projects':
        setShowVoid(false);
        // Navigate to projects
        break;
      case 'about':
        setShowVoid(false);
        // Navigate to about
        break;
      default:
        break;
    }
  };
  
  // Hide theme switcher when viewing a database item
  const isDataItemPage = location.pathname.includes('/database/');
  
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
      
      {/* VHS Blue Void Simulation - Triggered by ESC */}
      <VoidSimulation 
        isVisible={showVoid}
        onClose={() => setShowVoid(false)}
        onObjectClick={handleVoidObjectClick}
      />
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
