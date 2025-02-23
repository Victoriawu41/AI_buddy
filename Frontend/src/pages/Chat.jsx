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
        setChatHistory(data);
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
    const newMessage = { role: 'user', content: inputMessage };
    const loadingMessage = { role: 'bot', content: '<SPINNER>' };
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
        updated[updated.length - 1] = { role: 'bot', content: '' };
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

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Handle file upload logic here
      console.log(file);
    }
  };

  const formatMessage = (message) => {
    if (message.includes('<SPINNER>')) {
      return <div className="spinner" />;
    }

    return <Markdown content={message} />;
  }

  return (
    <div className="container" style={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <div className="card" style={{ height: '100%', width: '100%' }}>
        <div className="card-body" style={{ flex: 1, overflowY: 'scroll' }}>
          <div className="messages custom-markdown">
            {chatHistory.map((message, index) => (
              <div key={index} className={`message ${message.role}`}>
                {formatMessage(message.content)}
              </div>
            ))}
          </div>
        </div>
        
        <div className="card-footer d-flex">
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
            style={{ overflow: 'hidden', maxHeight: '600px' }} // Limit the height to 200px
          />
          <button className="btn btn-primary" onClick={handleSend}>Send</button>
        </div>
      </div>
    </div>
  )
}

export default Chat