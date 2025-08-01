import { toast } from "react-toastify";

class NotificationService {
  constructor() {
    this.checkInterval = null;
    this.settings = this.loadSettings();
    this.sentNotifications = new Set();
  }

  loadSettings() {
    try {
      const saved = localStorage.getItem('farmlog-notification-settings');
      return saved ? JSON.parse(saved) : {
        enabled: true,
        reminderMinutes: 60,
        categories: {
          watering: true,
          fertilizing: true,
          harvesting: true,
          planting: true,
          maintenance: true,
          pest_control: true
        }
      };
    } catch (error) {
      console.error('Failed to load notification settings:', error);
      return {
        enabled: true,
        reminderMinutes: 60,
        categories: {
          watering: true,
          fertilizing: true,
          harvesting: true,
          planting: true,
          maintenance: true,
          pest_control: true
        }
      };
    }
  }

  saveSettings(settings) {
    this.settings = settings;
    try {
      localStorage.setItem('farmlog-notification-settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save notification settings:', error);
    }
  }

  async requestPermission() {
    if (typeof Notification === 'undefined') {
      throw new Error('Notifications not supported');
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  showNotification(title, options = {}) {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') {
      return null;
    }

    const notification = new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options
    });

    return notification;
  }

  startMonitoring(tasks) {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    // Check every minute
    this.checkInterval = setInterval(() => {
      this.checkTaskReminders(tasks);
    }, 60000);

    // Initial check
    this.checkTaskReminders(tasks);
  }

  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  checkTaskReminders(tasks) {
    if (!this.settings.enabled || Notification.permission !== 'granted') {
      return;
    }

    const now = new Date();
    const reminderWindow = this.settings.reminderMinutes * 60 * 1000; // Convert to milliseconds

    tasks.forEach(task => {
      if (task.completed) return;
      
      // Check if this task category is enabled for notifications
      if (!this.settings.categories[task.type]) return;

      const taskTime = new Date(task.dueDate);
      const timeDiff = taskTime.getTime() - now.getTime();
      const reminderTime = reminderWindow;

      // Check if we should send a reminder (within 1 minute of reminder time)
      const shouldRemind = timeDiff <= reminderTime && timeDiff > (reminderTime - 60000);
      
      // Create unique key for this notification
      const notificationKey = `${task.Id}-${this.settings.reminderMinutes}`;
      
      if (shouldRemind && !this.sentNotifications.has(notificationKey)) {
        this.sendTaskReminder(task);
        this.sentNotifications.add(notificationKey);
        
        // Clean up old notification keys
        if (this.sentNotifications.size > 100) {
          const oldKeys = Array.from(this.sentNotifications).slice(0, 50);
          oldKeys.forEach(key => this.sentNotifications.delete(key));
        }
      }
    });
  }

  sendTaskReminder(task) {
    const timeUntil = this.formatTimeUntil(new Date(task.dueDate));
    
    const notification = this.showNotification(
      `Farm Task Reminder: ${task.title}`,
      {
        body: `${task.type} task due ${timeUntil}`,
        tag: `task-${task.Id}`,
        requireInteraction: true,
        actions: [
          { action: 'complete', title: 'Mark Complete' },
          { action: 'view', title: 'View Task' }
        ]
      }
    );

    if (notification) {
      notification.onclick = () => {
        window.focus();
        // You could navigate to the task here
        notification.close();
      };

      // Auto-close after 10 seconds
      setTimeout(() => {
        if (notification) {
          notification.close();
        }
      }, 10000);
    }

    // Also show toast notification as fallback
    toast.info(`Reminder: ${task.title} is due ${timeUntil}`, {
      autoClose: 8000,
      onClick: () => {
        // Navigate to tasks page
        window.location.hash = '#/tasks';
      }
    });
  }

  formatTimeUntil(targetDate) {
    const now = new Date();
    const diff = targetDate.getTime() - now.getTime();
    
    if (diff <= 0) {
      return "now";
    }

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `in ${days} day${days !== 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `in ${hours} hour${hours !== 1 ? 's' : ''}`;
    } else {
      return `in ${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
  }

  getDailyTaskSummary(tasks) {
    const today = new Date();
    const todayStr = today.toDateString();
    
    const todayTasks = tasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      return taskDate.toDateString() === todayStr && !task.completed;
    });

    if (todayTasks.length === 0) return null;

    return {
      count: todayTasks.length,
      tasks: todayTasks,
      message: `You have ${todayTasks.length} task${todayTasks.length !== 1 ? 's' : ''} due today`
    };
  }

  sendDailySummary(tasks) {
    const summary = this.getDailyTaskSummary(tasks);
    if (!summary) return;

    this.showNotification(
      'Daily Farm Tasks Summary',
      {
        body: summary.message,
        tag: 'daily-summary',
        requireInteraction: false
      }
    );
  }

  // Clean up when service is destroyed
  destroy() {
    this.stopMonitoring();
    this.sentNotifications.clear();
  }
}

export const notificationService = new NotificationService();
export default notificationService;