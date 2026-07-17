import express from "express";
import { Op, fn, col, literal } from "sequelize";
import { sequelize } from "../config/db.js";
import {
  Lead,
  Opportunity,
  Expense,
  LedgerEntry,
  Employee,
  Ticket,
} from "../models/index.js";

import { protect } from "../middleware/auth.js";

const router = express.Router();

const getCompany = (req) =>
  req.headers["x-company-id"] || req.context?.companyId;

const MONTHS = [
  "",
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

router.get("/sales", protect, async (req, res, next) => {
  try {
    const company = getCompany(req);

    const { startDate, endDate } = req.query;

    const where = {
      companyId: company,
    };

    if (startDate || endDate) {
      where.createdAt = {};

      if (startDate)
        where.createdAt[Op.gte] = new Date(startDate);

      if (endDate)
        where.createdAt[Op.lte] = new Date(endDate);
    }

    const stages = await Opportunity.findAll({
      where,

      attributes: [
        "stage",
        [fn("COUNT", col("id")), "count"],
        [fn("SUM", col("value")), "value"],
      ],

      group: ["stage"],

      raw: true,
    });

    res.json(
      stages.map((stage) => ({
        stage: stage.stage,
        count: Number(stage.count),
        value: Number(stage.value || 0),
      }))
    );
  } catch (err) {
    next(err);
  }
});

router.get("/leads-funnel", protect, async (req, res, next) => {
  try {
    const company = getCompany(req);

    const funnel = await Lead.findAll({
      where: {
        companyId: company,
      },

      attributes: [
        "stage",
        [fn("COUNT", col("id")), "count"],
      ],

      group: ["stage"],

      raw: true,
    });

    res.json(
      funnel.map((lead) => ({
        stage: lead.stage,
        count: Number(lead.count),
      }))
    );
  } catch (err) {
    next(err);
  }
});

router.get("/financial", protect, async (req, res, next) => {
  try {
    const company = getCompany(req);
    const year = req.query.year || new Date().getFullYear();

    const expenses = await Expense.findAll({
      where: {
        companyId: company,
        status: "approved",
        date: {
          [Op.between]: [
            `${year}-01-01`,
            `${year}-12-31`,
          ],
        },
      },

      attributes: [
        [fn("MONTH", col("date")), "month"],
        [fn("SUM", col("amount")), "total"],
      ],

      group: [fn("MONTH", col("date"))],

      raw: true,
    });

    const revenue = await LedgerEntry.findAll({
      where: {
        companyId: company,
        type: "credit",
        date: {
          [Op.between]: [
            `${year}-01-01`,
            `${year}-12-31`,
          ],
        },
      },

      attributes: [
        [fn("MONTH", col("date")), "month"],
        [fn("SUM", col("credit")), "total"],
      ],

      group: [fn("MONTH", col("date"))],

      raw: true,
    });

    res.json({
      expenses: expenses.map((e) => ({
        month: MONTHS[Number(e.month)],
        total: Number(e.total),
      })),

      revenue: revenue.map((r) => ({
        month: MONTHS[Number(r.month)],
        total: Number(r.total),
      })),
    });
  } catch (err) {
    next(err);
  }
});

router.get("/dashboard", protect, async (req, res, next) => {
  try {
    const company = getCompany(req);

    const totalRevenue =
      (await LedgerEntry.sum("credit", {
        where: {
          companyId: company,
          type: "credit",
        },
      })) || 0;

    const wonDeals = await Opportunity.count({
      where: {
        companyId: company,
        stage: "Closed Won",
      },
    });

    const employees = await Employee.count({
      where: {
        companyId: company,
      },
    });

    const openTickets = await Ticket.count({
      where: {
        companyId: company,
        status: "Open",
      },
    });

    const pipelineRaw = await Opportunity.findAll({
      where: {
        companyId: company,
      },

      attributes: [
        "stage",
        [fn("COUNT", col("id")), "count"],
        [fn("SUM", col("value")), "value"],
      ],

      group: ["stage"],

      raw: true,
    });

    const totalPipeline =
      pipelineRaw.reduce(
        (sum, item) => sum + Number(item.value || 0),
        0
      ) || 1;

    const pipeline = pipelineRaw.map((item) => ({
      name: item.stage,
      value: Number(item.value || 0),
      count: Number(item.count),
      percent: Math.round(
        (Number(item.value || 0) / totalPipeline) * 100
      ),
    }));

    const leadRaw = await Lead.findAll({
      where: {
        companyId: company,
      },

      attributes: [
        "source",
        [fn("COUNT", col("id")), "count"],
      ],

      group: ["source"],

      raw: true,
    });

    const totalLeads =
      leadRaw.reduce(
        (sum, item) => sum + Number(item.count),
        0
      ) || 1;

    const leadSources = leadRaw.map((item) => ({
      source: item.source || "Other",
      count: Number(item.count),
      percent: Math.round(
        (Number(item.count) / totalLeads) * 100
      ),
    }));

    res.json({
      totalRevenue,

      revenueGrowth: 12.4,

      wonDeals,

      dealsGrowth: 8.6,

      employees,

      openTickets,

      ticketChange: -4.2,

      pipeline,

      leadSources,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/revenue-by-month", protect, async (req, res, next) => {
  try {
    const company = getCompany(req);
    const year = req.query.year || new Date().getFullYear();

    const revenue = await LedgerEntry.findAll({
      where: {
        companyId: company,
        type: "credit",
        date: {
          [Op.between]: [
            `${year}-01-01`,
            `${year}-12-31`,
          ],
        },
      },

      attributes: [
        [fn("MONTH", col("date")), "month"],
        [fn("SUM", col("credit")), "revenue"],
      ],

      group: [fn("MONTH", col("date"))],

      order: [[fn("MONTH", col("date")), "ASC"]],

      raw: true,
    });

    res.json({
      data: revenue.map((item) => ({
        month: MONTHS[Number(item.month)],
        revenue: Number(item.revenue),
      })),
    });
  } catch (err) {
    next(err);
  }
});

router.get("/sales-report", protect, async (req, res, next) => {
  try {
    const company = getCompany(req);

    const report = await Opportunity.findAll({
      where: {
        companyId: company,
        stage: "Closed Won",
      },

      attributes: [
        [fn("MONTH", col("updatedAt")), "month"],
        [fn("COUNT", col("id")), "deals"],
        [fn("SUM", col("value")), "revenue"],
      ],

      group: [fn("MONTH", col("updatedAt"))],

      order: [[fn("MONTH", col("updatedAt")), "ASC"]],

      raw: true,
    });

    res.json({
      data: report.map((item) => ({
        month: MONTHS[Number(item.month)],
        deals: Number(item.deals),
        revenue: Number(item.revenue || 0),
      })),
    });
  } catch (err) {
    next(err);
  }
});

router.get("/sales-forecast", protect, async (req, res, next) => {
  try {
    const company = getCompany(req);

    const forecast = await Opportunity.findAll({
      where: {
        companyId: company,
        stage: {
          [Op.notIn]: ["Closed Lost"],
        },
      },

      attributes: [
        [fn("MONTH", col("closeDate")), "month"],
        [
          fn(
            "SUM",
            sequelize.literal("value * probability / 100")
          ),
          "forecast",
        ],
      ],

      group: [fn("MONTH", col("closeDate"))],

      order: [[fn("MONTH", col("closeDate")), "ASC"]],

      raw: true,
    });

    res.json({
      data: forecast.map((item) => ({
        month: MONTHS[Number(item.month)],
        forecast: Number(item.forecast || 0),
      })),
    });
  } catch (err) {
    next(err);
  }
});
export default router;