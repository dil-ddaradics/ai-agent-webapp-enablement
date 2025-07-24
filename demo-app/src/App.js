import logo from './logo.svg';
import './App.css';
import { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState('Welcome to AI-observed React!');

  const incrementCounter = () => {
    setCount(count + 1);
  };

  const changeMessage = () => {
    const messages = [
      'Hello from AI-observed React!', 
      'This app is being monitored by Claude',
      'Browser MCP enables live interaction',
      'Try clicking more buttons!',
      'AI can see these interactions'
    ];
    const randomIndex = Math.floor(Math.random() * messages.length);
    setMessage(messages[randomIndex]);
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1>{message}</h1>
        <p>
          Counter value: <code>{count}</code>
        </p>
        <div className="button-container">
          <button 
            className="App-button" 
            onClick={incrementCounter}
          >
            Increment Counter
          </button>
          <button 
            className="App-button" 
            onClick={changeMessage}
          >
            Change Message
          </button>
        </div>
        <p className="App-small-text">
          Edit <code>src/App.js</code> to modify this application.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
