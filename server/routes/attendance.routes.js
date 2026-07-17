import express from "express";
import { Op, fn, col } from "sequelize";
import { Attendance, Employee, Shift } from "../models/index.js";
import { protect } from "../middleware/auth.js";

import { createNotification } from "../services/notification.service.js";
const router = express.Router();

const getCompany = (req) => req.companyId;
router.get("/", protect, async (req, res, next) => {
  try {
    const companyId = getCompany(req);

    if (!companyId) {
      return res.status(400).json({
        message: "Company not found",
      });
    }

    const { page = 1, limit = 25, date, status, search } = req.query;
    const where = {
      companyId,
    };
    if (status) where.status = status;
    if (date) {
      const d = new Date(date);
      const start = new Date(d.setHours(0, 0, 0, 0));
      const end = new Date(d.setHours(23, 59, 59, 999));
      where.date = { [Op.gte]: start, [Op.lte]: end };
    }
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Mongoose used populate(...match) to filter on a joined field and then
    // dropped rows whose employee didn't match. Sequelize: filter the
    // include directly with `where`, and use `required: true` (inner join)
    // so non-matching rows are excluded by the DB, not after the fact.
    const employeeWhere = search
      ? {
          [Op.or]: [
            { firstName: { [Op.like]: `%${search}%` } },
            { lastName: { [Op.like]: `%${search}%` } },
          ],
        }
      : undefined;

    const { rows: attendance, count: total } = await Attendance.findAndCountAll(
      {
        where,
        order: [["date", "DESC"]],
        offset,
        limit: parseInt(limit),
        include: [
          {
            model: Employee,
            as: "employee",
            attributes: ["firstName", "lastName", "department", "avatar"],
            where: employeeWhere,
            required: !!search,
          },
          {
            model: Shift,
            as: "shift",
            attributes: ["id", "name", "startTime", "endTime"],
          },
        ],
      },
    );

    res.json({ attendance, total });
  } catch (err) {
    next(err);
  }
});

router.post("/checkin", protect, async (req, res, next) => {
  try {
    const companyId = getCompany(req);

    if (!companyId) {
      return res.status(400).json({
        message: "Company not found",
      });
    }

    const employee = await Employee.findByPk(req.body.employeeId);

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const existing = await Attendance.findOne({
      where: {
        employeeId: req.body.employeeId,
        companyId,
        date: {
          [Op.between]: [start, end],
        },
      },
    });

    if (existing) {
      return res.status(400).json({
        message: "Employee has already checked in today.",
      });
    }
    const now = new Date();
    const record = await Attendance.create({
      ...req.body,
      companyId,
      shiftId: req.body.shiftId,
      date: now,
      checkIn: now,
    });

    await createNotification({
      companyId: record.companyId,
      userId: req.user.id,
      senderId: req.user.id,
      module: "hr",
      type: "attendance_checkin",
      title: "Attendance Checked In",
      message: `${employee.firstName} ${employee.lastName} checked in successfully.`,
      priority: "low",
      actionUrl: "/hr/attendance",
      metadata: {
        attendanceId: record.id,
        employeeId: employee.id,
      },
    });

    res.status(201).json(record);
  } catch (err) {
    next(err);
  }
});

router.patch("/:id/checkout", protect, async (req, res, next) => {
  try {
    const companyId = getCompany(req);

    if (!companyId) {
      return res.status(400).json({
        message: "Company not found",
      });
    }

    const record = await Attendance.findByPk(req.params.id);

    if (!record) {
      return res.status(404).json({
        message: "Record not found",
      });
    }

    const employee = await Employee.findByPk(record.employeeId);

    const checkOut = new Date();

    const hours = (checkOut - record.checkIn) / (1000 * 60 * 60);

    record.checkOut = checkOut;
    record.hoursWorked = Math.round(hours * 100) / 100;

    await record.save();

    await createNotification({
      companyId: record.companyId,
      userId: req.user.id,
      senderId: req.user.id,
      module: "hr",
      type: "attendance_checkout",
      title: "Attendance Checked Out",
      message: `${employee.firstName} ${employee.lastName} checked out successfully.`,
      priority: "low",
      actionUrl: "/hr/attendance",
      metadata: {
        attendanceId: record.id,
        employeeId: employee.id,
      },
    });

    res.json(record);
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", protect, async (req, res, next) => {
  try {
    const companyId = getCompany(req);

    if (!companyId) {
      return res.status(400).json({
        message: "Company not found",
      });
    }

    const record = await Attendance.findByPk(req.params.id);

    if (!record) {
      return res.status(404).json({
        message: "Record not found",
      });
    }

    

    const { status, checkIn, checkOut, notes } = req.body;
    let hoursWorked = null;

if (checkIn && checkOut) {
    hoursWorked =
        Math.round(
            ((new Date(checkOut) - new Date(checkIn)) /
                (1000 * 60 * 60)) *
                100
        ) / 100;
}
    await record.update({
      status,
      checkIn,
      checkOut,
      shiftId: req.body.shiftId,
      notes,
       hoursWorked,
    });

    

    const employee = await Employee.findByPk(record.employeeId);

    await createNotification({
      companyId: record.companyId,
      userId: req.user.id,
      senderId: req.user.id,
      module: "hr",
      type: "attendance_updated",
      title: "Attendance Updated",
      message: `${employee.firstName} ${employee.lastName}'s attendance has been updated.`,
      priority: "medium",
      actionUrl: "/hr/attendance",
      metadata: {
        attendanceId: record.id,
        employeeId: employee.id,
      },
    });

    res.json(record);
  } catch (err) {
    next(err);
  }
});

router.get("/shifts", protect, (req, res) =>
  res.json([
    { _id: "1", name: "Morning", start: "09:00", end: "17:00" },
    { _id: "2", name: "Evening", start: "14:00", end: "22:00" },
  ]),
);

router.get("/summary", protect, async (req, res, next) => {
  try {
    const companyId = getCompany(req);
    if (!companyId) {
      return res.status(400).json({
        message: "Company not found",
      });
    }
    // Mongoose $group by status -> Sequelize group by + count
    const summary = await Attendance.findAll({
      where: { companyId },
      attributes: ["status", [fn("COUNT", col("id")), "count"]],
      group: ["status"],
      raw: true,
    });
    // shape to match the old { _id, count } output
    res.json(summary.map((s) => ({ _id: s.status, count: Number(s.count) })));
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", protect, async (req, res, next) => {
  try {
    const companyId = getCompany(req);

    if (!companyId) {
      return res.status(400).json({
        message: "Company not found",
      });
    }

    const record = await Attendance.findByPk(req.params.id);

    if (!record) {
      return res.status(404).json({
        message: "Record not found",
      });
    }

    const employee = await Employee.findByPk(record.employeeId);

    await createNotification({
      companyId: record.companyId,
      userId: req.user.id,
      senderId: req.user.id,
      module: "hr",
      type: "attendance_deleted",
      title: "Attendance Deleted",
      message: `${employee.firstName} ${employee.lastName}'s attendance has been deleted.`,
      priority: "low",
      actionUrl: "/hr/attendance",
      metadata: {
        attendanceId: record.id,
        employeeId: employee.id,
      },
    });

    await record.destroy();

    res.json({
      message: "Attendance deleted",
    });
  } catch (err) {
    next(err);
  }
});

export default router;
