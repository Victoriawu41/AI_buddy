import React, { useState, useEffect } from 'react'
import hljs from 'highlight.js'
// import 'highlight.js/styles/atom-one-dark-reasonable.css'
import './Chat.css'
// import 'katex/dist/katex.min.css'
import { Markdown } from '../widgets/Markdown'

const Chat = () => {
  const [chatHistory, setChatHistory] = useState([]);           // Chat history
  const [inputMessage, setInputMessage] = useState('');         // Request

  useEffect(() => {
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
    if (!inputMessage.trim()) {
      return;
    }
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
      formData.append('filename', file.name); // Add filename to FormData

      try {
        const response = await fetch('http://localhost:8000/ai/chat/upload', {
          method: 'POST',
          body: formData,
          credentials: 'include'
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Upload failed:', response.status, errorText);
          return;
        }

        const result = await response.json();
        console.log(result);
      } catch (err) {
        console.error('Upload error:', err);
      }
    }
  };

  const formatMessage = (message) => {
    if (message.includes('<SPINNER>')) {
      return <div className="spinner" />;
    }

    return <Markdown content={message} />;
  }

  return (
    <div style={{ position: 'relative', height: '100vh' }}>
      <div className="messages custom-markdown" style={{ paddingBottom: '80px', overflowY: 'auto', padding: '20px 240px', height: 'calc(100% - 80px)' }}>
        {chatHistory.map((message, index) => (
          <div key={index} className={`message ${message.role}`} style={message.style}>
            {formatMessage(message.content)}
          </div>
        ))}
      </div>
      
      <div className="d-flex" style={{ position: 'absolute', bottom: 0, width: '100%', background: '#fff', padding: '20px 400px', boxShadow: '0 -2px 5px rgba(0,0,0,0.1)' }}>
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
          style={{ overflow: 'hidden', maxHeight: '600px', borderRadius: '10px' }}
        />
        <button className="btn btn-primary" onClick={handleSend} style={{ borderRadius: '10px' }}>Send</button>
      </div>
    </div>
  )
}

export default Chat