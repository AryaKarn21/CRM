import express from "express";
import { Meeting, User, Company } from "../models/index.js";
import { notifyMeetingCreated } from "../services/notification.service.js";

const router = express.Router();

/**
 * GET ALL MEETINGS
 */
router.get("/", async (req, res) => {
  try {
    const meetings = await Meeting.findAll({
      where: {
        companyId: req.companyId,
        isDeleted: false,
      },
      include: [
        {
          model: User,
          as: "organizer",
          attributes: ["id", "name", "email"],
        },
        {
          model: Company,
          as: "company",
          attributes: ["id", "name"],
        },
      ],
      order: [["startTime", "ASC"]],
    });

    res.json({
      success: true,
      count: meetings.length,
      data: meetings,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

/**
 * GET SINGLE MEETING
 */
router.get("/:id", async (req, res) => {
  try {
    const meeting = await Meeting.findOne({
      where: {
        id: req.params.id,
        companyId: req.companyId,
        isDeleted: false,
      },
      include: [
        {
          model: User,
          as: "organizer",
          attributes: ["id", "name", "email"],
        },
        {
          model: Company,
          as: "company",
          attributes: ["id", "name"],
        },
      ],
    });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found",
      });
    }

    res.json({
      success: true,
      data: meeting,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

/**
 * CREATE MEETING
 */

router.post("/", async (req, res) => {
  try {
    const {
      title,
      description,
      meetingType,
      meetingLink,
      location,
      startTime,
      endTime,
      priority,
      reminderMinutes,
    } = req.body;

    if (!title || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "Title, Start Time and End Time are required",
      });
    }

    if (new Date(startTime) >= new Date(endTime)) {
      return res.status(400).json({
        success: false,
        message: "End time must be after Start time",
      });
    }

    const meeting = await Meeting.create({
      companyId: req.companyId,
      organizerId: req.user.id,
      createdBy: req.user.id,
      title,
      description,
      meetingType,
      meetingLink,
      location,
      startTime,
      endTime,
      priority,
      reminderMinutes,
    });

    // Automatically notify attendees / creator
    await notifyMeetingCreated({
      meeting,
      attendeeIds: req.body.attendeeIds || [],
      senderId: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: "Meeting created successfully",
      data: meeting,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

/**
 * UPDATE MEETING
 */
router.patch("/:id", async (req, res) => {
  try {
    const meeting = await Meeting.findOne({
      where: {
        id: req.params.id,
        companyId: req.companyId,
        isDeleted: false,
      },
    });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found",
      });
    }

    const {
      title,
      description,
      meetingType,
      meetingLink,
      location,
      startTime,
      endTime,
      priority,
      reminderMinutes,
      status,
    } = req.body;

    if (startTime && endTime) {
      if (new Date(startTime) >= new Date(endTime)) {
        return res.status(400).json({
          success: false,
          message: "End time must be after Start time",
        });
      }
    }

    await meeting.update({
      title: title ?? meeting.title,
      description: description ?? meeting.description,
      meetingType: meetingType ?? meeting.meetingType,
      meetingLink: meetingLink ?? meeting.meetingLink,
      location: location ?? meeting.location,
      startTime: startTime ?? meeting.startTime,
      endTime: endTime ?? meeting.endTime,
      priority: priority ?? meeting.priority,
      reminderMinutes: reminderMinutes ?? meeting.reminderMinutes,
      status: status ?? meeting.status,
    });

    await meeting.reload();

    res.json({
      success: true,
      message: "Meeting updated successfully",
      data: meeting,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

/**
 * SOFT DELETE MEETING
 */
router.delete("/:id", async (req, res) => {
  try {
    const meeting = await Meeting.findOne({
      where: {
        id: req.params.id,
        companyId: req.companyId,
        isDeleted: false,
      },
    });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found",
      });
    }

    await meeting.update({
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy: req.user.id,
    });

    res.json({
      success: true,
      message: "Meeting deleted successfully",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

/**
 * RESTORE MEETING
 */
router.patch("/:id/restore", async (req, res) => {
  try {
    const meeting = await Meeting.findOne({
      where: {
        id: req.params.id,
        companyId: req.companyId,
        isDeleted: true,
      },
    });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found",
      });
    }

    await meeting.update({
      isDeleted: false,
      deletedAt: null,
      deletedBy: null,
    });

    res.json({
      success: true,
      message: "Meeting restored successfully",
      data: meeting,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

export default router;
