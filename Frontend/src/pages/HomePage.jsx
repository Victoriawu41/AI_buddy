import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavBar from "../Components/Calendar/Navbar";
import './HomePage.css';

const HomePage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const navigate = useNavigate();
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // Make an API call to check if the user is authenticated.
    axios
      .get("http://localhost:5001/verify", { withCredentials: true })
      .then((response) => {
        setIsAuthenticated(true);
      })
      .catch((error) => {
        setIsAuthenticated(false);
      });
  }, []);

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  // While still verifying, show a loading message
  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  const handleFeatureClick = (path) => {
    if (isAuthenticated) {
      navigate(path);
    } else {
      setShowLoginPrompt(true);
    }
  };

  const closeLoginPrompt = () => {
    setShowLoginPrompt(false);
  };

  const redirectToLogin = () => {
    navigate('/login');
  };

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <div>
      <NavBar theme={theme} />
      <button className="theme-toggle" onClick={toggleTheme}>
        {theme === 'light' ? 'Dark' : 'Light'}
      </button>
      <div className={`container ${theme}`}>
        <div className="jumbotron text-center animate-jumbotron">
          <h1 className="display-4">Welcome to AI Buddy</h1>
          <p className="lead">Your personal assistant for managing tasks, chatting, and scheduling.</p>
        </div>
        <div className="row">
          <div className="col-md-4">
            <div className="card mb-4 shadow-sm animate-card" onClick={() => handleFeatureClick('/chat')}>
              <div className="card-body center-text">
                <h5 className="card-title">Chat</h5>
                <p className="card-text">Engage in real-time conversations with our AI-powered chat feature.</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card mb-4 shadow-sm animate-card" onClick={() => handleFeatureClick('/calendar')}>
              <div className="card-body center-text">
                <h5 className="card-title">Calendar</h5>
                <p className="card-text">Keep track of your events and appointments with our integrated calendar.</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card mb-4 shadow-sm animate-card" onClick={() => handleFeatureClick('/quercus-scraper')}>
              <div className="card-body center-text">
                <h5 className="card-title">Quercus Scraper</h5>
                <p className="card-text">Scrape Quercus home pages for weekly topic summaries.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showLoginPrompt && (
        <div className="login-prompt-overlay">
          <div className={`login-prompt ${theme}`}>
            <p>Please log in to learn more about this feature.</p>
            <button onClick={redirectToLogin}>Login</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;