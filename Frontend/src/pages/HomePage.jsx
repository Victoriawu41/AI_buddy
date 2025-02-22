import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from "../Components/Calendar/Navbar";
import './HomePage.css';

const HomePage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const navigate = useNavigate();

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

  return (
    <div>
      <NavBar />
      <div className="container mt-5">
        <div className="jumbotron text-center animate-jumbotron">
          <h1 className="display-4">Welcome to AI Buddy</h1>
          <p className="lead">Your personal assistant for managing tasks, chatting, and scheduling.</p>
        </div>
        <div className="row">
          <div className="col-md-4">
            <div className="card mb-4 shadow-sm animate-card" onClick={() => handleFeatureClick('/chat')}>
              <div className="card-body">
                <h5 className="card-title">Chat</h5>
                <p className="card-text">Engage in real-time conversations with our AI-powered chat feature.</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card mb-4 shadow-sm animate-card" onClick={() => handleFeatureClick('/calendar')}>
              <div className="card-body">
                <h5 className="card-title">Calendar</h5>
                <p className="card-text">Keep track of your events and appointments with our integrated calendar.</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card mb-4 shadow-sm animate-card" onClick={() => handleFeatureClick('/quercus-scraper')}>
              <div className="card-body">
                <h5 className="card-title">Quercus Scraper</h5>
                <p className="card-text">Scrape Quercus home pages for weekly topic summaries.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showLoginPrompt && (
        <div className="login-prompt-overlay animate-overlay">
          <div className="login-prompt animate-prompt">
            <p>Please log in to learn more about this feature.</p>
            <button onClick={closeLoginPrompt}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;