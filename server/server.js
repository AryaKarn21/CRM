import "./env.js"; // MUST be the first import — loads .env before anything else touches process.env

import express from "express";
import cors from "cors";
import { sequelize } from "./config/db.js";
import "./models/index.js"; // registers all associations before sync/queries run
import path from "path";

import authRoutes from "./routes/auth.routes.js";
import leadsRoutes from "./routes/leads.routes.js";
import accountsRoutes from "./routes/accounts.routes.js";
import contactsRoutes from "./routes/contacts.routes.js";
import opportunitiesRoutes from "./routes/opportunities.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import employeesRoutes from "./routes/employees.routes.js";
import performanceRoutes from "./routes/performance.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import shiftRoutes from "./routes/shifts.routes.js";
import leavesRoutes from "./routes/leaves.routes.js";
import payrollRoutes from "./routes/payroll.routes.js";
import financeRoutes from "./routes/finance.routes.js";
import inventoryRoutes from "./routes/inventory.routes.js";
import procurementRoutes from "./routes/procurement.routes.js";
import projectsRoutes from "./routes/projects.routes.js";
import supportRoutes from "./routes/support.routes.js";
import reportsRoutes from "./routes/reports.routes.js";
import settingsRoutes from "./routes/settings.routes.js";
import rolesRoutes from "./routes/roles.routes.js";
import auditRoutes from "./routes/audit.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { protect } from "./middleware/auth.js";
import { resolveCompany } from "./middleware/tenant.js";
import meetingsRoutes from "./routes/meetings.routes.js";
import meetingAttendeeRoutes from "./routes/meetingAttendees.routes.js";
import usersRoutes from "./routes/users.routes.js";
import notificationsRoutes from "./routes/notifications.routes.js";
import emailRoutes from "./routes/email.routes.js";
import { startScheduler } from "./services/scheduler.service.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/api/auth", authRoutes);

app.use("/api/meetings", protect, resolveCompany, meetingsRoutes);
app.use("/api/meeting-attendees", protect, resolveCompany, meetingAttendeeRoutes);

app.use("/api/leads", protect, resolveCompany, leadsRoutes);
app.use("/api/accounts", protect, resolveCompany, accountsRoutes);
app.use("/api/contacts", protect, resolveCompany, contactsRoutes);
app.use("/api/opportunities", protect, resolveCompany, opportunitiesRoutes);
app.use("/api/dashboard", protect, resolveCompany, dashboardRoutes);
app.use("/api/employees", protect, resolveCompany, employeesRoutes);
app.use("/api/performance", protect, resolveCompany, performanceRoutes);
app.use("/api/users", protect, resolveCompany, usersRoutes);
app.use("/api/attendance", protect, resolveCompany, attendanceRoutes);
app.use("/api/shifts", protect, resolveCompany, shiftRoutes);
app.use("/api/leaves", protect, resolveCompany, leavesRoutes);
app.use("/api/payroll", protect, resolveCompany, payrollRoutes);
app.use("/api/finance", protect, resolveCompany, financeRoutes);
app.use("/api/inventory", protect, resolveCompany, inventoryRoutes);
app.use("/api/procurement", protect, resolveCompany, procurementRoutes);
app.use("/api/projects", protect, resolveCompany, projectsRoutes);
app.use("/api/support", protect, resolveCompany, supportRoutes);
app.use("/api/reports", protect, resolveCompany, reportsRoutes);
app.use("/api/notifications", protect, resolveCompany, notificationsRoutes);
app.use("/api/settings", protect, settingsRoutes);
app.use("/api/roles", protect, resolveCompany, rolesRoutes);
app.use("/api/audit-logs", protect, resolveCompany, auditRoutes);
app.use("/api/email", protect, resolveCompany, emailRoutes);
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log("MySQL connected");

    // sync() creates tables that don't exist yet based on the model
    // definitions. This replaces Mongoose's schema-less auto-creation.
    // alter:true updates existing tables to match models in dev; remove
    // alter (or use proper migrations) once the schema stabilizes.
    //
    // TEMPORARILY ENABLED: Role and AuditLog models just gained new
    // columns (isActive/isDeleted/deletedAt on Role; module/device/
    // browser/status on AuditLog). Those tables already exist in the DB
    // from before, and bare sync() never adds columns to existing
    // tables — only alter:true actually runs the ALTER TABLE statements
    // needed to bring the real schema in line with the model. Once this
    // has run successfully once, switch back to plain sequelize.sync().
    await sequelize.sync();
    console.log("Database synced");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      startScheduler();
    });
  } catch (err) {
    console.error("========== ERROR ==========");
    console.error(err);
    console.error(err.stack);
    console.error("===========================");
    process.exit(1);
  }
}

start();