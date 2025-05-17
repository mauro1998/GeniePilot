import { message, notification } from 'antd';

type NotificationType = 'success' | 'info' | 'warning' | 'error';

interface NotificationOptions {
  duration?: number;
  key?: string;
  description?: string;
}

/**
 * Notification service for consistent error handling across the application
 */
const notificationService = {
  /**
   * Shows a toast message
   */
  message(type: NotificationType, content: string, duration = 3) {
    message[type](content, duration);
  },

  /**
   * Shows a notification with title and optional description
   */
  notify(
    type: NotificationType,
    title: string,
    options: NotificationOptions = {},
  ) {
    notification[type]({
      message: title,
      description: options.description,
      duration: options.duration || 4.5,
      key: options.key,
    });
  },

  /**
   * Handles error with appropriate user notification
   * Logs to console and shows user-friendly message
   */
  handleError(
    error: unknown,
    userMessage = 'An error occurred. Please try again.',
  ) {
    console.error(error);
    this.message('error', userMessage);
    return error; // Return for potential chaining
  },
};

export default notificationService;
