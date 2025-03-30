import React, { createContext, useEffect, useState } from 'react';

// Create the context
export const ThemeContext = createContext();

// Theme provider component
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');

  // Load saved theme from localStorage on first render
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
      document.body.className = savedTheme;
    }
  }, []);

  // When theme changes, update localStorage
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.body.className = newTheme; 
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
