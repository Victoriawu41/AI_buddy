import React, { useEffect, useState } from 'react';
import { registerToastCallback, getToastMessages, removeToast } from '../utils/notifications';
import './Toast.css';

const Toast = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    // Register callback for updates
    registerToastCallback(setToasts);
    
    // Initialize with any existing messages
    setToasts(getToastMessages());
    
    return () => {
      // Clean up by setting callback to null
      registerToastCallback(null);
    };
  }, []);

  const handleClose = (id) => {
    removeToast(id);
  };

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast-notification toast-${toast.type}`}>
          <div className="toast-content">{toast.message}</div>
          <button className="toast-close" onClick={() => handleClose(toast.id)}>×</button>
        </div>
      ))}
    </div>
  );
};

export default Toast;
