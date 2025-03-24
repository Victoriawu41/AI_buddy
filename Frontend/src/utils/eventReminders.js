import { notify } from './notifications';

class EventReminderService {
  constructor() {
    this.isRunning = false;
    this.interval = null;
    this.checkInterval = 10000; // 10 seconds
  }

  async checkNotifications() {
    try {
      // Check for notifications
      const response = await fetch('http://localhost:8000/ai/notifications/peek', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Network error: ${response.status}`);
      }
      
      const notification = await response.json();
      if (!notification) {
        return; // No notifications to process
      }
      
      // Pop the notification from the queue
      const popResponse = await fetch('http://localhost:8000/ai/notifications/pop', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      
      if (!popResponse.ok) {
        throw new Error(`Error removing notification: ${popResponse.status}`);
      }

      // Display the notification with all options (toast, browser, sound)
      notify(notification.message, { 
        type: notification.type || 'info',
        sound: true,
        browser: true
      });
      
    } catch (error) {
      console.error('Error checking for event notifications:', error);
    }
  }

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    
    // Check immediately
    this.checkNotifications();
    
    // Then set up periodic checks
    this.interval = setInterval(() => {
      this.checkNotifications();
    }, this.checkInterval);
    
    console.log('Event reminder service started');
  }

  stop() {
    if (!this.isRunning) return;
    
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    
    this.isRunning = false;
    console.log('Event reminder service stopped');
  }
}

// Create a singleton instance
export const reminderService = new EventReminderService();
