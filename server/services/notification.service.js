import { Notification } from "../models/index.js";

export const createNotification = async ({
  companyId,
  userId,
  senderId = null,
  module,
  type,
  title,
  message,
  priority = "medium",
  actionUrl = null,
  metadata = {},
}) => {
  return await Notification.create({
    companyId,
    userId,
    senderId,
    module,
    type,
    title,
    message,
    priority,
    actionUrl,
    metadata,
  });
};

export const notifyUsers = async ({
  companyId,
  userIds,
  senderId = null,
  module,
  type,
  title,
  message,
  priority = "medium",
  actionUrl = null,
  metadata = {},
}) => {
  if (!userIds || !userIds.length) return [];

  return await Notification.bulkCreate(
    userIds.map((userId) => ({
      companyId,
      userId,
      senderId,
      module,
      type,
      title,
      message,
      priority,
      actionUrl,
      metadata,
    })),
  );
};

export const notifyMeetingCreated = async ({
  meeting,
  attendeeIds = [],
  senderId,
}) => {
  // Remove duplicates and don't notify the creator
  const users = [...new Set(attendeeIds)].filter((id) => id !== senderId);

  if (!users.length) return;

  await notifyUsers({
    companyId: meeting.companyId,
    userIds: users,
    senderId,

    // Fixed: "meeting" is not a valid module
    module: "calendar",

    type: "meeting_created",

    title: "New Meeting Scheduled",

    message: `${meeting.title} has been scheduled.`,

    priority: "medium",

    actionUrl: null,

    metadata: {
      meetingId: meeting.id,
    },
  });
};

export const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOne({
    where: {
      id: notificationId,
      userId,
    },
  });

  if (!notification) return null;

  notification.isRead = true;

  await notification.save();

  await notification.save();

  return notification;
};

export const markAllAsRead = async (userId) => {
  return await Notification.update(
    {
      isRead: true,
      
    },
    {
      where: {
        userId,
        isRead: false,
      },
    },
  );
};

// Get unread notification count
export const getUnreadCount = async (userId) => {
  return await Notification.count({
    where: {
      userId,
      isRead: false,
    },
  });
};

// Get notifications
export const getNotifications = async (userId, page = 1, limit = 20) => {
  page = Math.max(1, Number(page));
  limit = Math.min(100, Math.max(1, Number(limit)));

  const result = await Notification.findAndCountAll({
    where: {
      userId,
    },
    order: [["createdAt", "DESC"]],
    offset: (page - 1) * limit,
    limit,
  });

  return {
    rows: result.rows,
    count: result.count,
    unreadCount: await getUnreadCount(userId),
  };
};

// Delete Notification
export const deleteNotification = async (notificationId, userId) => {
  const notification = await Notification.findOne({
    where: {
      id: notificationId,
      userId,
    },
  });

  if (!notification) {
    return false;
  }

  await notification.destroy();

  return true;
};
