import React, { useState } from 'react'
import axios from 'axios'
// import './Chat.css' // Optional: for styling

const Chat = () => {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')

  const handleSend = async () => {
    if (input.trim() === '') return
    const newMessages = [...messages, { role: 'user', content: input }]
    setMessages(newMessages)
    setInput('')

    try {
      const response = await axios.post('http://127.0.0.1:8000/ai/chat', {
        messages: [{ role: 'user', content: input }]
      })

      if (response.status === 200) {
        setMessages([...newMessages, { role: 'ai', content: response.data }])
      } else {
        setMessages([...newMessages, { role: 'system', content: `Error: ${response.status} - ${response.statusText}` }])
      }
    } catch (error) {
      setMessages([...newMessages, { role: 'system', content: `Error: ${error.message}` }])
    }
  }

  return (
    <div className="chat-container">
      <div className="chat-box">
        {messages.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.role}`}>
            <strong>{msg.role === 'user' ? 'You' : 'AI'}:</strong> {msg.content}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  )
}

export default Chat