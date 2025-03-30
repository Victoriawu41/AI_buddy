import React, { useState, useEffect } from 'react';
import './ChatSettings.css';
import axios from 'axios';

import { ThemeContext } from '../ThemeContext';
import { useContext } from 'react';

const ChatSettings = ({ onClose }) => {
  const [settings, setSettings] = useState({
    assistantName: '',
    assistantSystemPrompt: '',
    userName: '',
    userSystemPrompt: '',
  });
  const [loading, setLoading] = useState(true); // State to manage loading

  const { theme, toggleTheme } = useContext(ThemeContext);
  

  useEffect(() => {
    // Fetch current settings from the back end
    axios.get('http://localhost:8000/ai/chat/settings', { withCredentials: true })
      .then(response => {
        setSettings(response.data);
        setLoading(false); // Set loading to false after fetching data
      })
      .catch(error => {
        console.error('Error fetching settings:', error);
        setLoading(false); // Set loading to false even if there's an error
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prevSettings) => ({
      ...prevSettings,
      [name]: value,
    }));
  };

  const handleSave = () => {
    // Save settings to the back end
    axios.post('http://localhost:8000/ai/chat/settings', settings, { withCredentials: true })
      .then(response => {
        console.log('Settings saved:', response.data);
        onClose();
      })
      .catch(error => {
        console.error('Error saving settings:', error);
      });
  };
  
  const backgroundColor = theme === 'light' ? '#ffffff' : '#454545';
  const textFieldColour = theme === 'light' ? '#ffffff' : "#303030";
  const colour = theme === 'light' ? 'black' : '#dedede'

  return (
    <div className="chat-settings-overlay">
      <div className="chat-settings" style={{background: backgroundColor}}>
        <h2>Chat Settings</h2>
        {loading ? (
          <div>Loading...</div> // Show loading indicator while fetching data
        ) : (
          <>
            <div className="form-group">
              <label htmlFor="assistantName">Assistant Name</label>
              <input
                type="text"
                id="assistantName"
                name="assistantName"
                value={settings.assistantName}
                onChange={handleChange}
                className="form-control"
                style={{ backgroundColor: textFieldColour, color: colour}}
              />
            </div>
            <div className="form-group">
              <label htmlFor="assistantSystemPrompt">Assistant System Prompt</label>
              <textarea
                id="assistantSystemPrompt"
                name="assistantSystemPrompt"
                value={settings.assistantSystemPrompt}
                onChange={handleChange}
                className="form-control"
                rows="3"
                style={{ backgroundColor: textFieldColour, color: colour}}
              />
            </div>
            <div className="form-group">
              <label htmlFor="userName">User Name</label>
              <input
                type="text"
                id="userName"
                name="userName"
                value={settings.userName}
                onChange={handleChange}
                className="form-control"
                style={{ backgroundColor: textFieldColour, color: colour}}
              />
            </div>
            <div className="form-group">
              <label htmlFor="userSystemPrompt">User System Prompt</label>
              <textarea
                id="userSystemPrompt"
                name="userSystemPrompt"
                value={settings.userSystemPrompt}
                onChange={handleChange}
                className="form-control"
                rows="3"
                style={{ backgroundColor: textFieldColour, color: colour}}
              />
            </div>
            <button className="btn btn-primary" onClick={handleSave}>Save</button>
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatSettings;
