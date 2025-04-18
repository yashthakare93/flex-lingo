// src/index.js or src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client'; // ✅ Correct import for React 18
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import './index.css'


const root = ReactDOM.createRoot(document.getElementById('root')); // ✅ use createRoot

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
