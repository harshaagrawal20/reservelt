import Notification from '../models/notification.model.js'

export const getUserNotifications = async (req, res) => {
  try {
    const { userId, userClerkId, type, isRead, page = 1, limit = 50 } = req.query
    
    const filter = {}
    if (userId) filter.userId = userId
    if (userClerkId) filter.userClerkId = userClerkId
    if (type) filter.type = type
    if (isRead !== undefined) filter.isRead = isRead === 'true'
    
    const numericLimit = Math.min(Number(limit) || 50, 100)
    const numericPage = Math.max(Number(page) || 1, 1)
    
    const [notifications, total] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .limit(numericLimit)
        .skip((numericPage - 1) * numericLimit)
        .lean(),
      Notification.countDocuments(filter)
    ])
    
    res.json({
      success: true,
      notifications,
      pagination: {
        page: numericPage,
        limit: numericLimit,
        total,
        pages: Math.ceil(total / numericLimit)
      }
    })
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch notifications', 
      error: error.message 
    })
  }
}

export const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params
    
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    )
    
    if (!notification) {
      return res.status(404).json({ 
        success: false, 
        message: 'Notification not found' 
      })
    }
    
    res.json({ success: true, notification })
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to mark notification as read', 
      error: error.message 
    })
  }
}

export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const { userId, userClerkId } = req.body
    
    const filter = {}
    if (userId) filter.userId = userId
    if (userClerkId) filter.userClerkId = userClerkId
    
    const result = await Notification.updateMany(
      filter,
      { isRead: true }
    )
    
    res.json({ 
      success: true, 
      message: `${result.modifiedCount} notifications marked as read` 
    })
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to mark notifications as read', 
      error: error.message 
    })
  }
}

export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params
    
    const notification = await Notification.findByIdAndDelete(notificationId)
    
    if (!notification) {
      return res.status(404).json({ 
        success: false, 
        message: 'Notification not found' 
      })
    }
    
    res.json({ success: true, message: 'Notification deleted' })
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete notification', 
      error: error.message 
    })
  }
}

export const getUnreadCount = async (req, res) => {
  try {
    const { userClerkId } = req.query
    
    const count = await Notification.countDocuments({
      userClerkId,
      isRead: false
    })
    
    res.json({ success: true, count })
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get unread count', 
      error: error.message 
    })
  }
}

export const createNotification = async (req, res) => {
  try {
    const notificationData = req.body
    
    const notification = new Notification(notificationData)
    await notification.save()
    
    res.status(201).json({ 
      success: true, 
      notification 
    })
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create notification', 
      error: error.message 
    })
  }
}
