import React, { useState } from 'react'
import axios from 'axios'

const Chat = () => {
  const [outputMessage, setOutputMessage] = useState([]);           // Respond
  const [inputMessage, setInputMessage] = useState('');             // Request

  const handleSend = async (e) => {
    e.preventDefault()
    try {
        const response = await axios.post('http://localhost:8000/ai/chat', {
          messages: [{ role: 'user', content: inputMessage }],
          user_name: "User",
        })

        if (response.status === 200) {
          console.log("DATA RECEIVED")
          setOutputMessage(response.data.results);
        }
    } catch (err) {
        console.error(error.response.data.message);
    }
}

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-6">
          <div className="card">
            <div className="card-header text-center">
              <h4>Chatbot</h4>
            </div>

            <div className="card-body" style={{ height: '400px', overflowY: 'scroll' }}>
              <div className="messages">
                {outputMessage}
              </div>
            </div>
            
            <div className="card-footer d-flex">
              <input
                type="text"
                className="form-control me-2"
                placeholder="Type your message..."
                onChange={(e) => setInputMessage(e.target.value)}
              />
              <button className="btn btn-primary" onClick={handleSend}>Send</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Chat