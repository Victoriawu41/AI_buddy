/**
 * Simple notifications system for browser and in-app notifications
 */

// Store for active toast notifications
let notificationStore = {
  toasts: [],
  callback: null
};

// Register notification callback
export const registerNotificationCallback = (callback) => {
  notificationStore.callback = callback;
  
  // Initial notification render
  if (callback) {
    callback([...notificationStore.toasts]);
  }
};

// Add a toast notification
export const addToast = (message, type = 'info') => {
  const id = Date.now();
  const toast = { id, message, type };
  
  notificationStore.toasts.push(toast);
  
  if (notificationStore.callback) {
    notificationStore.callback([...notificationStore.toasts]);
  }
  
  return id;
};

// Remove a toast notification
export const removeToast = (id) => {
  notificationStore.toasts = notificationStore.toasts.filter(toast => toast.id !== id);
  
  if (notificationStore.callback) {
    notificationStore.callback([...notificationStore.toasts]);
  }
};

// Get all toast notifications
export const getToasts = () => {
  return [...notificationStore.toasts];
};

// Request browser notification permission
export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    console.warn("This browser does not support desktop notifications");
    return false;
  }
  
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

// Show a browser notification
export const showBrowserNotification = (title, options = {}) => {
  if (Notification.permission !== "granted") {
    return null;
  }
  
  try {
    const notification = new Notification(title, {
      icon: '/favicon.ico',
      ...options
    });
    
    notification.onclick = () => {
      window.focus();
      if (options.onClick) options.onClick();
      notification.close();
    };
    
    return notification;
  } catch (error) {
    console.error("Error showing browser notification:", error);
    return null;
  }
};

// Play a notification sound
export const playNotificationSound = () => {
  try {
    const audio = new Audio('/sounds/notification.mp3');
    return audio.play();
  } catch (error) {
    console.error("Error playing notification sound:", error);
    return Promise.reject(error);
  }
};

// Single function to handle all notification types
export const notify = (message, options = {}) => {
  const { type = 'info', sound = true, browser = !document.hasFocus() } = options;
  
  // Add in-app toast
  const id = addToast(message, type);
  
  // Show browser notification if requested and page not focused
  if (browser) {
    showBrowserNotification('Notification', { body: message });
  }
  
  // Play sound if requested
  if (sound) {
    playNotificationSound().catch(() => {});
  }
  
  return id;
};
