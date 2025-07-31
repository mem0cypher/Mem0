import React, { createContext, useState, useContext, useEffect } from 'react';

// Define theme variables
export const themes = {
  mem0: {
    name: 'mem0',
    backgroundColor: '#000000',
    textColor: '#FFFFFF',
    accentColor: '#333333',
    highlightColor: '#CCCCCC',
    headerTitle: 'mem0',
    sidebarTitle: 'Projects',
    mainTitle: 'database',
    mainSubtitle: ''
  }
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    // Get theme from local storage or default to 'mem0'
    return localStorage.getItem('theme') || 'mem0';
  });
  
  // Apply theme to document and save to local storage
  useEffect(() => {
    const theme = themes[currentTheme];
    document.documentElement.style.setProperty('--theme-bg', theme.backgroundColor);
    document.documentElement.style.setProperty('--theme-text', theme.textColor);
    document.documentElement.style.setProperty('--theme-accent', theme.accentColor);
    document.documentElement.style.setProperty('--theme-highlight', theme.highlightColor);
    
    // Add a class to the body for additional theme-specific styling
    document.body.className = `theme-${currentTheme}`;
    
    // Save theme to local storage
    localStorage.setItem('theme', currentTheme);

    // Smooth transition
    document.body.style.transition = 'background-color 0.5s ease';
  }, [currentTheme]);
  
  const toggleTheme = (themeName) => {
    setCurrentTheme(themeName);
  };
  
  return (
    <ThemeContext.Provider value={{ 
      currentTheme, 
      toggleTheme, 
      theme: themes[currentTheme] 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

export default ThemeContext; 