import express from 'express';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getUnreadCount,
  createNotification
} from '../controllers/notification.controller.js';

const router = express.Router();

// Get user notifications
router.get('/', getUserNotifications);

// Get unread notifications count
router.get('/unread-count', getUnreadCount);

// Create notification
router.post('/', createNotification);

// Mark notification as read
router.put('/:notificationId/read', markNotificationAsRead);
router.patch('/:notificationId/read', markNotificationAsRead);

// Mark all notifications as read
router.put('/read-all', markAllNotificationsAsRead);
router.patch('/mark-all-read', markAllNotificationsAsRead);

// Delete notification
router.delete('/:notificationId', deleteNotification);

export default router;
