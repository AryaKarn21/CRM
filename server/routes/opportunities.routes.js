import express from "express";
import { Op } from "sequelize";
import { Opportunity, Account, User } from "../models/index.js";
import { protect } from "../middleware/auth.js";
import { createNotification } from "../services/notification.service.js";

const router = express.Router();

const getCompany = (req) => req.companyId;

// =========================
// Get All Opportunities
// =========================
router.get("/", protect, async (req, res, next) => {
  try {
    const company = getCompany(req);

    const {
      page = 1,
      limit = 20,
      search,
      stage,
      sortKey = "value",
      sortDir = "desc",
    } = req.query;

    const where = {};

    if (company) where.companyId = company;

    if (stage) where.stage = stage;

    if (search) {
      where.name = {
        [Op.like]: `%${search}%`,
      };
    }

    const offset = (page - 1) * limit;

    const { rows: opportunities, count: total } =
      await Opportunity.findAndCountAll({
        where,
        offset,
        limit: Number(limit),

        order: [[sortKey, sortDir === "asc" ? "ASC" : "DESC"]],

        include: [
          {
            model: Account,
            as: "account",
            attributes: ["id", "name"],
          },
          {
            model: User,
            as: "assignedTo",
            attributes: ["id", "name"],
          },
        ],
      });

    res.json({
      opportunities,
      total,
    });
  } catch (err) {
    next(err);
  }
});

// =========================
// Get Opportunity By ID
// =========================
router.get("/:id", protect, async (req, res, next) => {
  try {
    const opp = await Opportunity.findByPk(req.params.id, {
      include: [
        {
          model: Account,
          as: "account",
          attributes: ["id", "name"],
        },
        {
          model: User,
          as: "assignedTo",
          attributes: ["id", "name"],
        },
      ],
    });

    if (!opp) {
      return res.status(404).json({
        message: "Opportunity not found",
      });
    }

    res.json(opp);
  } catch (err) {
    next(err);
  }
});

// =========================
// Create Opportunity
// =========================
router.post("/", protect, async (req, res, next) => {
  try {
    const opp = await Opportunity.create({
      ...req.body,
      companyId: req.companyId,
    });

    await createNotification({
      companyId: opp.companyId,
      userId: req.user.id,
      senderId: req.user.id,

      module: "crm",
      type: "opportunity_created",

      title: "New Opportunity Created",

      message: `${opp.name} has been created successfully.`,

      priority: "medium",

      actionUrl: `/crm/opportunities/${opp.id}`,

      metadata: {
        opportunityId: opp.id,
      },
    });

    res.status(201).json(opp);
  } catch (err) {
    next(err);
  }
});

// =========================
// Update Opportunity
// =========================
router.patch("/:id", protect, async (req, res, next) => {
  try {
    const opp = await Opportunity.findByPk(req.params.id);

    if (!opp) {
      return res.status(404).json({
        message: "Opportunity not found",
      });
    }

    const previousAssignee = opp.assignedToId;

    await opp.update(req.body);

    // Assignment Notification
    if (
      req.body.assignedToId &&
      req.body.assignedToId !== previousAssignee
    ) {
      await createNotification({
        companyId: opp.companyId,

        userId: req.body.assignedToId,

        senderId: req.user.id,

        module: "crm",

        type: "opportunity_assigned",

        title: "Opportunity Assigned",

        message: `${opp.name} has been assigned to you.`,

        priority: "high",

        actionUrl: `/crm/opportunities/${opp.id}`,

        metadata: {
          opportunityId: opp.id,
        },
      });
    }

    // Update Notification
    await createNotification({
      companyId: opp.companyId,

      userId: req.user.id,

      senderId: req.user.id,

      module: "crm",

      type: "opportunity_updated",

      title: "Opportunity Updated",

      message: `${opp.name} has been updated successfully.`,

      priority: "medium",

      actionUrl: `/crm/opportunities/${opp.id}`,

      metadata: {
        opportunityId: opp.id,
      },
    });

    res.json(opp);
  } catch (err) {
    next(err);
  }
});

// =========================
// Update Stage
// =========================
router.patch("/:id/stage", protect, async (req, res, next) => {
  try {
    const opp = await Opportunity.findByPk(req.params.id);

    if (!opp) {
      return res.status(404).json({
        message: "Opportunity not found",
      });
    }

    await opp.update({
      stage: req.body.stage,
    });

    res.json(opp);
  } catch (err) {
    next(err);
  }
});

// =========================
// Delete Opportunity
// =========================
router.delete("/:id", protect, async (req, res, next) => {
  try {
    const opp = await Opportunity.findByPk(req.params.id);

    if (!opp) {
      return res.status(404).json({
        message: "Opportunity not found",
      });
    }

    await createNotification({
      companyId: opp.companyId,

      userId: req.user.id,

      senderId: req.user.id,

      module: "crm",

      type: "opportunity_deleted",

      title: "Opportunity Deleted",

      message: `${opp.name} has been deleted.`,

      priority: "low",

      metadata: {
        opportunityId: opp.id,
      },
    });

    await opp.destroy();

    res.json({
      message: "Deleted",
    });
  } catch (err) {
    next(err);
  }
});

// =========================
// Timeline
// =========================
router.get("/:id/timeline", protect, (req, res) => {
  res.json({
    items: [],
  });
});

export default router;