import React, { useState, useEffect } from 'react';
import { registerNotificationCallback, getToasts, removeToast } from '../utils/notifications';
import './Toast.css';

function Toast() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    // Setup toast notification listener
    registerNotificationCallback(setToasts);
    
    // Cleanup on unmount
    return () => registerNotificationCallback(null);
  }, []);

  // If no toasts, don't render anything
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast-item toast-${toast.type}`}>
          <div className="toast-content">{toast.message}</div>
          <button 
            type="button"
            className="toast-close-btn"
            onClick={() => removeToast(toast.id)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

export default Toast;
