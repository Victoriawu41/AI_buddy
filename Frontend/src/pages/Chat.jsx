import React, { useState, useEffect } from 'react'
import hljs from 'highlight.js'
// import 'highlight.js/styles/atom-one-dark-reasonable.css'
import './Chat.css'
// import 'katex/dist/katex.min.css'
import { Markdown } from '../widgets/Markdown'
import ChatSettings from '../widgets/ChatSettings' // Import the new ChatSettings component
import { notify, requestNotificationPermission } from '../utils/notifications' // Import notification utilities

import { ThemeContext } from '../ThemeContext';
import { useContext } from 'react';

const Chat = () => {
  const [chatHistory, setChatHistory] = useState([]);           // Chat history
  const [inputMessage, setInputMessage] = useState('');         // Request
  const [showSettings, setShowSettings] = useState(false); // State to manage settings menu visibility
  const [uploadSound] = useState(new Audio('/sounds/notification.mp3')); // Sound for upload notification
  const [isProcessing, setIsProcessing] = useState(false); // Track if a message is being processed

  const { theme, toggleTheme } = useContext(ThemeContext);
  

  useEffect(() => {
    // Request notification permission when component mounts
    requestNotificationPermission();
    
    fetch('http://localhost:8000/ai/chat/messages', {credentials: 'include'})
      .then(res => res.json())
      .then(data => {
        const styledData = data.map(message => ({
          ...message,
          style: {
            borderRadius: '5px',
            padding: '10px',
            marginBottom: '5px',
          }
        }));
        setChatHistory(styledData);
      })
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    document.querySelectorAll('pre code').forEach((block) => {
      hljs.highlightBlock(block);
    });
  }, [chatHistory]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isProcessing) {
      return;
    }
    
    setIsProcessing(true); // Set processing flag to prevent multiple requests
    
    const newMessage = { role: 'user', content: inputMessage, style: { borderRadius: '10px', padding: '10px', marginBottom: '10px'} };
    const loadingMessage = { role: 'bot', content: '<SPINNER>', style: { borderRadius: '10px', padding: '10px', marginBottom: '10px' } };
    setChatHistory([...chatHistory, newMessage, loadingMessage]);
    setInputMessage('');

    try {
      const response = await fetch('http://localhost:8000/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: inputMessage }], user_name: "User" }),
        credentials: 'include'
      });
      const reader = response.body.getReader();
      let partialContent = '';
      setChatHistory((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'bot', content: '', style: { borderRadius: '10px', padding: '10px', marginBottom: '10px' } };
        return updated;
      });
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        partialContent = partialContent.replace(/▓$/, '');
        partialContent += new TextDecoder().decode(value) + '▓';
        setChatHistory((prev) => {
          const updated = [...prev];
          updated[updated.length - 1].content = partialContent;
          return updated;
        });
      }
      // Remove the trailing ASCII 178 symbol
      partialContent = partialContent.replace(/▓$/, '');
      setChatHistory((prev) => {
        const updated = [...prev];
        updated[updated.length - 1].content = partialContent;
        return updated;
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false); // Reset processing flag when done
    }
  }

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 600)}px`;
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('filename', file.name);

      try {
        const response = await fetch('http://localhost:8000/ai/chat/upload', {
          method: 'POST',
          body: formData,
          credentials: 'include'
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Upload failed:', response.status, errorText);
          notify(`Upload failed: ${errorText}`, { type: 'error' });
          return;
        }

        // Show success notification with sound
        notify(`File "${file.name}" uploaded successfully!`, { 
          type: 'success', 
          sound: true 
        });
      } catch (err) {
        console.error('Upload error:', err);
        notify(`Upload error: ${err.message}`, { type: 'error' });
      }
    }
  };

  const formatMessage = (message) => {
    if (message.includes('<SPINNER>')) {
      return <div className="spinner" />;
    }

    return <Markdown content={message} />;
  }

  const backgroundColor = theme === 'light' ? '#ffffff' : '#454545';
  const bgc = theme === 'light' ? '#ffffff' : "#bababa";

  return (
    <div style={{ position: 'relative', height: '100vh' }}>

      <button className="theme-toggle" onClick={toggleTheme}>
        {theme === 'light' ? 'Dark' : 'Light'}
      </button>

      <button className="btn btn-secondary settings-button" onClick={() => setShowSettings(true)} style={{ borderRadius: '10px' }}>Settings</button>
      <div className="messages custom-markdown" style={{ paddingBottom: '80px', overflowY: 'auto', padding: '20px 240px', height: 'calc(100% - 80px)' }}>
        {chatHistory.map((message, index) => (
          <div key={index} className={`message ${message.role}`} style={message.style}>
            {formatMessage(message.content)}
          </div>
        ))}
      </div>
      
      <div className="d-flex" style={{ position: 'absolute', bottom: 0, width: '100%', background: backgroundColor, padding: '20px 400px', boxShadow: '0 -2px 5px rgba(0,0,0,0.1)' }}>
        <label className="btn btn-secondary me-2">
          +
          <input type="file" style={{ display: 'none' }} onChange={handleFileUpload} />
        </label>
        <textarea
          className="form-control me-2"
          placeholder="Type your message..."
          value={inputMessage}
          onChange={handleInputChange}
          rows="1"
          style={{ overflow: 'hidden', maxHeight: '600px', borderRadius: '10px' , backgroundColor: bgc}}
          disabled={isProcessing} // Disable input while processing
        />
        <button 
          className="btn btn-primary" 
          onClick={handleSend} 
          style={{ borderRadius: '10px' }}
          disabled={isProcessing} // Disable send button while processing
        >
          {isProcessing ? 'Working...' : 'Send'}
        </button>
      </div>
      {showSettings && <ChatSettings onClose={() => setShowSettings(false)} />} {/* Render ChatSettings if showSettings is true */}
    </div>
  )
}

export default Chat