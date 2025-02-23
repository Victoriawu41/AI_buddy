import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const NavBar = () => {
  const [isNavVisible, setIsNavVisible] = useState(false);

  // Toggle the visibility of the vertical navbar
  const toggleNav = () => {
    setIsNavVisible(!isNavVisible);
  };

  // Check if the user is authenticated
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <div>
      {/* Button to toggle the navbar visibility */}
      <button className="nav-toggle-btn" onClick={toggleNav}>
        &#9776; {/* Hamburger icon for a small button */}
      </button>

      {/* Vertical navbar */}
      <div className={`vertical-navbar ${isNavVisible ? 'show' : ''}`}>
        <div className="navbar-content">
          <Link to="/home" className="navbar-item" onClick={() => setIsNavVisible(false)}>
            Home
          </Link>
          {isAuthenticated ? (
            <>
              <Link to="/chat" className="navbar-item" onClick={() => setIsNavVisible(false)}>
                Chat
              </Link>
              <Link to="/calendar" className="navbar-item" onClick={() => setIsNavVisible(false)}>
                Calendar
              </Link>
            </>
          ) : (
            <Link to="/login" className="navbar-item" onClick={() => setIsNavVisible(false)}>
              Login
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default NavBar;