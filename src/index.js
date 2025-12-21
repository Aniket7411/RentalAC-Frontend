import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Suppress ResizeObserver errors - these are harmless browser warnings
// that occur when ResizeObserver callbacks trigger layout changes
// This is a known issue with framer-motion and other animation libraries
const originalError = console.error;
console.error = (...args) => {
  if (args.length > 0) {
    const errorMessage = String(args[0] || '');
    const fullMessage = args.map(arg => String(arg || '')).join(' ');
    if (
      errorMessage.includes('ResizeObserver loop completed') ||
      errorMessage.includes('ResizeObserver loop limit exceeded') ||
      errorMessage.includes('ResizeObserver loop') ||
      errorMessage.includes('ResizeObserver') ||
      fullMessage.includes('ResizeObserver loop completed') ||
      fullMessage.includes('ResizeObserver loop limit exceeded') ||
      fullMessage.includes('ResizeObserver')
    ) {
      return; // Suppress this specific error
    }
  }
  originalError.apply(console, args);
};

// Suppress ResizeObserver errors from error event listeners
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    if (
      event.message &&
      (event.message.includes('ResizeObserver loop completed') ||
       event.message.includes('ResizeObserver loop limit exceeded') ||
       event.message.includes('ResizeObserver'))
    ) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  }, true);
}

// Suppress ResizeObserver errors from unhandled promise rejections
const originalUnhandledRejection = window.onunhandledrejection;
window.onunhandledrejection = (event) => {
  if (
    event.reason &&
    typeof event.reason === 'object' &&
    event.reason.message &&
    (event.reason.message.includes('ResizeObserver') ||
     event.reason.message.includes('ResizeObserver loop'))
  ) {
    event.preventDefault();
    return;
  }
  if (originalUnhandledRejection) {
    originalUnhandledRejection(event);
  }
};

// Also suppress ResizeObserver errors from window.onerror
const originalWindowError = window.onerror;
window.onerror = (message, source, lineno, colno, error) => {
  if (
    typeof message === 'string' &&
    (message.includes('ResizeObserver loop completed') ||
     message.includes('ResizeObserver loop limit exceeded') ||
     message.includes('ResizeObserver loop') ||
     message.includes('ResizeObserver'))
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
