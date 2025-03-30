import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Navbar.css';

const NavBar = ({ theme }) => {
  const [isNavVisible, setIsNavVisible] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const navigate = useNavigate();

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

  // While still verifying, show a loading message
  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  // Toggle the visibility of the vertical navbar
  const toggleNav = () => {
    setIsNavVisible(!isNavVisible);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div>
      {/* Button to toggle the navbar visibility */}
      <button className="nav-toggle-btn" onClick={toggleNav}>
        &#9776; {/* Hamburger icon for a small button */}
      </button>

      {/* Vertical navbar */}
      <div className={`vertical-navbar ${isNavVisible ? 'show' : ''} ${theme}`}>
        <div className="navbar-content">
          <Link to="/home" className={`navbar-item ${theme}`} onClick={() => setIsNavVisible(false)}>
            Home
          </Link>
          {isAuthenticated ? (
            <>
              <Link to="/chat" className={`navbar-item ${theme}`} onClick={() => setIsNavVisible(false)}>
                Chat
              </Link>
              <Link to="/calendar" className={`navbar-item ${theme}`} onClick={() => setIsNavVisible(false)}>
                Calendar
              </Link>
              <Link to="/quercus-scraper" className={`navbar-item ${theme}`} onClick={() => setIsNavVisible(false)}>
                Quercus Scraper
              </Link>
              <Link to="/logout" className={`navbar-item ${theme} logout-link`}>
                Logout
              </Link>
            </>
          ) : (
            <Link to="/login" className={`navbar-item ${theme}`} onClick={() => setIsNavVisible(false)}>
              Login
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default NavBar;