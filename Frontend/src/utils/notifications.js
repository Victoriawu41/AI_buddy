/**
 * Utility functions for handling browser and in-app notifications
 */

// Check if the browser supports notifications
export const checkNotificationPermission = () => {
  if (!("Notification" in window)) {
    console.warn("This browser does not support desktop notifications");
    return false;
  }
  return true;
};

// Request notification permission
export const requestNotificationPermission = async () => {
  if (!checkNotificationPermission()) return false;
  
  if (Notification.permission === "granted") {
    return true;
  }
  
  try {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return false;
  }
};

// Send a browser notification
export const sendBrowserNotification = (title, options = {}) => {
  if (Notification.permission === "granted") {
    const notification = new Notification(title, {
      icon: '/favicon.ico',
      ...options
    });
    
    // Handle notification click if needed
    notification.onclick = function() {
      window.focus();
      if (options.onClick) options.onClick();
      notification.close();
    };
    
    return notification;
  }
  return null;
};

// Toast notification messages stored in memory
let toastMessages = [];
// Callback function for updating toast in UI
let updateToastCallback = null;

// Register a callback to update toast in UI
export const registerToastCallback = (callback) => {
  updateToastCallback = callback;
};

// Send an in-app toast notification
export const sendToastNotification = (message, type = 'info', duration = 5000) => {
  const id = Date.now();
  const toast = { id, message, type, duration };
  toastMessages.push(toast);
  
  if (updateToastCallback) {
    updateToastCallback([...toastMessages]); // Ensure a new array is passed to trigger re-render
  }
  
  // Auto-remove after duration
  setTimeout(() => {
    removeToast(id);
  }, duration);
  
  return id;
};

// Remove a toast notification
export const removeToast = (id) => {
  toastMessages = toastMessages.filter(toast => toast.id !== id);
  
  if (updateToastCallback) {
    updateToastCallback([...toastMessages]); // Ensure a new array is passed to trigger re-render
  }
};

// Get all toast messages
export const getToastMessages = () => {
  return [...toastMessages];
};
