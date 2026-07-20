import cron from "node-cron";
import { Op } from "sequelize";
import { Meeting, MeetingAttendee, User } from "../models/index.js";
import { notifyUsers } from "./notification.service.js";
import { sendMeetingReminderEmail } from "./emailNotification.service.js";

// Runs once a minute. Cron granularity is per-minute, so this is the
// tightest useful interval — a meeting's reminderMinutes (5, 10, 15, 30,
// 60, 1440) will fire within ~60 seconds of the intended time, not exactly
// on the second.
const CRON_EXPRESSION = "* * * * *";

async function processMeetingReminders() {
  const now = new Date();

  const upcomingMeetings = await Meeting.findAll({
    where: {
      status: "scheduled",
      isDeleted: false,
      startTime: { [Op.gt]: now },
    },
    include: [
      {
        model: MeetingAttendee,
        as: "attendees",
        where: { reminderSent: false },
        required: true,
        include: [{ model: User, as: "user", attributes: ["id", "name", "email"] }],
      },
    ],
  });

  for (const meeting of upcomingMeetings) {
    const minutesUntilStart = (new Date(meeting.startTime) - now) / 60000;

    if (!meeting.reminderMinutes || minutesUntilStart > meeting.reminderMinutes) {
      continue;
    }

    const dueAttendees = meeting.attendees || [];
    if (!dueAttendees.length) continue;

    const userIds = dueAttendees.map((a) => a.userId);

    await notifyUsers({
      companyId: meeting.companyId,
      userIds,
      module: "calendar",
      type: "meeting_reminder",
      title: "Meeting Reminder",
      message: `${meeting.title} starts in ${
        meeting.reminderMinutes >= 1440
          ? `${Math.round(meeting.reminderMinutes / 1440)} day(s)`
          : `${meeting.reminderMinutes} minutes`
      }.`,
      priority: "high",
      metadata: { meetingId: meeting.id },
    });

    for (const attendee of dueAttendees) {
      const user = attendee.user;
      if (!user?.email) continue;

      try {
        await sendMeetingReminderEmail({
          to: user.email,
          recipientName: user.name,
          meeting,
          minutesBefore: meeting.reminderMinutes,
        });
      } catch (err) {
        console.error(`Failed to send meeting reminder email to ${user.email}:`, err.message);
        continue;
      }

      attendee.reminderSent = true;
      await attendee.save();
    }
  }
}

export function startScheduler() {
  cron.schedule(CRON_EXPRESSION, async () => {
    try {
      await processMeetingReminders();
    } catch (err) {
      console.error("Meeting reminder scheduler error:", err);
    }
  });

  console.log("✅ Meeting reminder scheduler started (checks every minute)");
}

/**
 * Manually fire the reminder for one meeting, bypassing the
 * reminderMinutes time-window check — used by the test endpoint so
 * developers/testers don't have to wait for the actual scheduled window.
 * By default this still respects reminderSent (won't re-email attendees
 * who already got one) unless force: true is passed.
 */
export async function sendReminderForMeeting(meetingId, { force = false } = {}) {
  const meeting = await Meeting.findOne({
    where: { id: meetingId, isDeleted: false },
    include: [
      {
        model: MeetingAttendee,
        as: "attendees",
        where: force ? {} : { reminderSent: false },
        required: false,
        include: [{ model: User, as: "user", attributes: ["id", "name", "email"] }],
      },
    ],
  });

  if (!meeting) {
    return { success: false, message: "Meeting not found" };
  }

  const dueAttendees = meeting.attendees || [];
  if (!dueAttendees.length) {
    return { success: false, message: "No attendees pending a reminder (try force: true)" };
  }

  const userIds = dueAttendees.map((a) => a.userId);

  await notifyUsers({
    companyId: meeting.companyId,
    userIds,
    module: "calendar",
    type: "meeting_reminder",
    title: "Meeting Reminder",
    message: `${meeting.title} starts soon.`,
    priority: "high",
    metadata: { meetingId: meeting.id },
  });

  const results = [];
  for (const attendee of dueAttendees) {
    const user = attendee.user;
    if (!user?.email) {
      results.push({ userId: attendee.userId, sent: false, reason: "No email on file" });
      continue;
    }

    try {
      await sendMeetingReminderEmail({
        to: user.email,
        recipientName: user.name,
        meeting,
        minutesBefore: meeting.reminderMinutes || 0,
      });
      attendee.reminderSent = true;
      await attendee.save();
      results.push({ userId: attendee.userId, email: user.email, sent: true });
    } catch (err) {
      results.push({ userId: attendee.userId, email: user.email, sent: false, reason: err.message });
    }
  }

  return { success: true, message: "Reminder processed", results };
}

export { processMeetingReminders };