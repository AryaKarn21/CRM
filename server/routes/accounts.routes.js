import express from "express";
import { Op } from "sequelize";
import { Account, Contact, Opportunity, User } from "../models/index.js";
import { protect } from "../middleware/auth.js";
import { createNotification } from "../services/notification.service.js";

const router = express.Router();

router.get("/", protect, async (req, res, next) => {
  try {
    const company = req.companyId;
    const {
      page = 1,
      limit = 20,
      search,
      type,
      sortKey = "createdAt",
      sortDir = "desc",
    } = req.query;
    const where = {};
    if (company) where.companyId = company;
    if (type) where.type = type;
    if (search)
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { rows: accounts, count: total } = await Account.findAndCountAll({
      where,
      order: [[sortKey, sortDir === "asc" ? "ASC" : "DESC"]],
      offset,
      limit: parseInt(limit),
      include: [{ model: User, as: "assignedTo", attributes: ["id", "name"] }],
    });
    res.json({ accounts, total });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", protect, async (req, res, next) => {
  try {
    const account = await Account.findByPk(req.params.id, {
      include: [{ model: User, as: "assignedTo", attributes: ["id", "name"] }],
    });
    if (!account) return res.status(404).json({ message: "Account not found" });
    res.json(account);
  } catch (err) {
    next(err);
  }
});
router.post("/", protect, async (req, res, next) => {
  try {
    const account = await Account.create({
      ...req.body,
      companyId: req.companyId,
    });

    await createNotification({
      companyId: account.companyId,
      userId: req.user.id,
      senderId: req.user.id,

      module: "crm",
      type: "account_created",

      title: "New Account Created",

      message: `${account.name} has been created successfully.`,

      priority: "medium",

      actionUrl: `/crm/accounts/${account.id}`,

      metadata: {
        accountId: account.id,
      },
    });

    res.status(201).json(account);
  } catch (err) {
    next(err);
  }
});
console.log("Assignment notification created.");
router.patch("/:id", protect, async (req, res, next) => {
  try {
    const account = await Account.findByPk(req.params.id);

    if (!account) {
      return res.status(404).json({
        message: "Account not found",
      });
    }

    const previousAssignee = account.assignedToId;

    await account.update(req.body);

    // Account Assigned
    if (req.body.assignedToId && req.body.assignedToId !== previousAssignee) {
      await createNotification({
        companyId: account.companyId,
        userId: req.body.assignedToId,
        senderId: req.user.id,

        module: "crm",
        type: "account_assigned",

        title: "Account Assigned",

        message: `${account.name} has been assigned to you.`,

        priority: "high",

        actionUrl: `/crm/accounts/${account.id}`,

        metadata: {
          accountId: account.id,
        },
      });
    }

    console.log("Previous Assignee:", previousAssignee);
    console.log("New Assignee:", req.body.assignedToId);

    // Account Updated
    await createNotification({
      companyId: account.companyId,
      userId: req.user.id,
      senderId: req.user.id,

      module: "crm",
      type: "account_updated",

      title: "Account Updated",

      message: `${account.name} has been updated successfully.`,

      priority: "medium",

      actionUrl: `/crm/accounts/${account.id}`,

      metadata: {
        accountId: account.id,
      },
    });

    res.json(account);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", protect, async (req, res, next) => {
  try {
    const account = await Account.findByPk(req.params.id);

    if (!account) {
      return res.status(404).json({
        message: "Account not found",
      });
    }

    await createNotification({
      companyId: account.companyId,
      userId: req.user.id,
      senderId: req.user.id,

      module: "crm",
      type: "account_deleted",

      title: "Account Deleted",

      message: `${account.name} has been deleted successfully.`,

      priority: "medium",

      metadata: {
        accountId: account.id,
      },
    });

    await account.destroy();

    res.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (err) {
    next(err);
  }
});

router.get("/:id/contacts", protect, async (req, res, next) => {
  try {
    const contacts = await Contact.findAll({
      where: { accountId: req.params.id },
    });
    res.json({ contacts });
  } catch (err) {
    next(err);
  }
});

router.get("/:id/opportunities", protect, async (req, res, next) => {
  try {
    const opportunities = await Opportunity.findAll({
      where: { accountId: req.params.id },
    });
    res.json({ opportunities });
  } catch (err) {
    next(err);
  }
});

router.get("/:id/timeline", protect, async (req, res, next) => {
  res.json({ items: [] });
});

export default router;
