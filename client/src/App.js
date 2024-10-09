import React from 'react';
import './App.css';
import ChatWindow from './ChatWindow';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>LocateAI</h1>
        <p>AI-powered address exploration for the USA</p>
      </header>
      <main>
        <ChatWindow />
      </main>
    </div>
  );
}

export default App;