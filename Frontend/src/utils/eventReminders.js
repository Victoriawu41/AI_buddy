import { sendToastNotification, sendBrowserNotification } from './notifications';

class EventReminderService {
    constructor() {
        this.isRunning = false;
        this.checkInterval = 5 * 60 * 1000; // 5 minutes
    }

    async checkNotifications() {
        try {
            // First peek at the notification
            const peekResponse = await fetch('http://localhost:8000/notifications/peek');
            if (!peekResponse.ok) throw new Error('Failed to peek notifications');
            
            const notification = await peekResponse.json();
            if (!notification) return;

            // If we have a notification, pop it from the queue
            const popResponse = await fetch('http://localhost:8000/notifications/pop', {
                method: 'POST'
            });
            if (!popResponse.ok) throw new Error('Failed to pop notification');

            // Show toast notification
            sendToastNotification(notification.message, 'info');
            
            // Show browser notification if page is not focused
            if (!document.hasFocus()) {
                sendBrowserNotification('Calendar Reminder', {
                    body: notification.message,
                    icon: '/favicon.ico'
                });
            }

            // Play notification sound
            const audio = new Audio('/sounds/notification.mp3');
            audio.play().catch(console.error);

        } catch (error) {
            console.error('Error checking notifications:', error);
        }
    }

    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.checkNotifications(); // Check immediately
        
        // Set up periodic checking
        this.interval = setInterval(() => {
            this.checkNotifications();
        }, this.checkInterval);
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        this.isRunning = false;
    }
}

export const reminderService = new EventReminderService();
