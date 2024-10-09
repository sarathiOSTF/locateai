import React, { useState } from 'react';
import './ChatWindow.css';

function ChatWindow() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = { text: inputMessage, isUser: true };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputMessage('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: inputMessage }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      const botMessage = { 
        text: data.reply, 
        isUser: false, 
        screenshotUrl: data.screenshotUrl,
        mapUrl: data.mapUrl
      };
      setMessages(prevMessages => [...prevMessages, botMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = { text: 'Sorry, an error occurred. Please try again.', isUser: false };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
  };

  const handleOpenMap = (url) => {
    window.open(url, '_blank');
  };

  return (
    <div className="chat-window">
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.isUser ? 'user-message' : 'bot-message'}`}>
            <p>{message.text}</p>
            <button onClick={() => handleCopy(message.text)}>Copy</button>
            {message.screenshotUrl && (
              <div>
                <img src={message.screenshotUrl} alt="Map Screenshot" className="map-screenshot" />
                <button onClick={() => handleOpenMap(message.mapUrl)}>Open in Google Maps</button>
              </div>
            )}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="chat-input-form">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Ask LocateAI about any USA address..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default ChatWindow;