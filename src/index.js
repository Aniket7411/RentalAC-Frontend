import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Suppress ResizeObserver errors - these are harmless browser warnings
// that occur when ResizeObserver callbacks trigger layout changes
const originalError = console.error;
console.error = (...args) => {
  const errorMessage = args[0]?.toString?.() || '';
  if (
    errorMessage.includes('ResizeObserver loop completed') ||
    errorMessage.includes('ResizeObserver loop limit exceeded') ||
    errorMessage.includes('ResizeObserver loop')
  ) {
    return; // Suppress this specific error
  }
  originalError.apply(console, args);
};

// Also suppress ResizeObserver errors from window.onerror
const originalWindowError = window.onerror;
window.onerror = (message, source, lineno, colno, error) => {
  if (
    typeof message === 'string' &&
    (message.includes('ResizeObserver loop completed') ||
     message.includes('ResizeObserver loop limit exceeded') ||
     message.includes('ResizeObserver loop'))
  ) {
    return true; // Suppress this error
  }
  if (originalWindowError) {
    return originalWindowError(message, source, lineno, colno, error);
  }
  return false;
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
