import express from "express";
import { protect } from "../middleware/auth.js";

import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  createNotification,
  deleteNotification,
} from "../services/notification.service.js";

const router = express.Router();

// Get Notifications
router.get("/", protect, async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);

    const notifications = await getNotifications(
      req.user.id,
      page,
      limit
    );

    res.json({
      success: true,
      ...notifications,
    });
  } catch (err) {
    next(err);
  }
});

// Get unread notification count
router.get("/unread-count", protect, async (req, res, next) => {
  try {
    const count = await getUnreadCount(req.user.id);

    res.json({
      success: true,
      count,
    });
  } catch (err) {
    next(err);
  }
});

// Mark one notification as read
router.patch("/:id/read", protect, async (req, res, next) => {
  try {
    const notification = await markAsRead(
      req.params.id,
      req.user.id
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.json({
      success: true,
      data: notification,
    });
  } catch (err) {
    next(err);
  }
});

// Mark all notifications as read
router.patch("/read-all", protect, async (req, res, next) => {
  try {
    await markAllAsRead(req.user.id);

    res.json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (err) {
    next(err);
  }
});

// Delete notification
router.delete("/:id", protect, async (req, res, next) => {
  try {
    const deleted = await deleteNotification(
      req.params.id,
      req.user.id
    );

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (err) {
    next(err);
  }
});

// Test notification
router.post("/test", protect, async (req, res, next) => {
  try {
    const notification = await createNotification({
      companyId: req.companyId,
      userId: req.user.id,
      senderId: req.user.id,

      // Must match Notification model ENUM
      module: "calendar",

      type: "test",
      title: "Notification System Working 🎉",
      message: "Congratulations! Your notification system is working.",
      priority: "medium",
    });

    res.json({
      success: true,
      data: notification,
    });
  } catch (err) {
    next(err);
  }
});

export default router;