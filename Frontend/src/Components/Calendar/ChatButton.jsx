import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const ChatButton = () => {
  return (
    <nav className="chat-button">
      <div className="chat-button-right">
        <Link to="/chat" className="chat-button-link">
          <button className="chat-button-button">Chat</button>
        </Link>
      </div>
    </nav>
  );
};

export default ChatButton;
