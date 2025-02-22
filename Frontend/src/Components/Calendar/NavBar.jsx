import React, { useState } from 'react'; // Import useState
import { Link } from 'react-router-dom';
import './Navbar.css';

const NavBar = () => {
  const [isNavVisible, setIsNavVisible] = useState(false);

  // Toggle the visibility of the vertical navbar
  const toggleNav = () => {
    setIsNavVisible(!isNavVisible);
  };

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
          <Link to="/chat" className="navbar-item" onClick={() => setIsNavVisible(false)}>
            Chat
          </Link>
          <Link to="/calendar" className="navbar-item" onClick={() => setIsNavVisible(false)}>
            Calendar
          </Link>
          <Link to="/logout" className="navbar-item logout-link">
            Logout
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NavBar;