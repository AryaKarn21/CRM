import express from "express";
import { Op, fn, col } from "sequelize";
import { sequelize } from "../config/db.js";
import {
  Lead,
  Opportunity,
  Expense,
  LedgerEntry,
  Employee,
  Ticket,
  InventoryItem,
} from "../models/index.js";

import { protect } from "../middleware/auth.js";

const router = express.Router();

const companyScope = (req) =>
  req.isCrossCompany ? {} : { companyId: req.companyId };

const MONTHS = [
  "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const zeroFillMonths = (rows, valueKeys) => {
  const byMonth = new Map(rows.map((r) => [Number(r.month), r]));
  return Array.from({ length: 12 }, (_, i) => {
    const m = i + 1;
    const row = byMonth.get(m);
    const entry = { month: MONTHS[m] };
    valueKeys.forEach((k) => {
      entry[k] = row ? Number(row[k] || 0) : 0;
    });
    return entry;
  });
};

const yearRange = (year) => [`${year}-01-01`, `${year}-12-31`];

const OPPORTUNITY_STAGE_ORDER = [
  "Prospecting", "Qualification", "Needs Analysis", "Value Proposition",
  "Decision Makers", "Perception Analysis", "Proposal/Price",
  "Negotiation/Review", "Closed Won", "Closed Lost",
];

const LEAD_FUNNEL_ORDER = [
  "New", "Contacted", "Qualified", "Proposal", "Negotiation", "Closed Won",
];

async function computeLeadSources(where) {
  const rows = await Lead.findAll({
    where,
    attributes: ["source", [fn("COUNT", col("id")), "count"]],
    group: ["source"],
    raw: true,
  });

  const total = rows.reduce((sum, r) => sum + Number(r.count), 0) || 1;

  return rows
    .map((r) => ({
      source: r.source || "Other",
      count: Number(r.count),
      percent: Math.round((Number(r.count) / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);
}

async function computePipeline(where) {
  const rows = await Opportunity.findAll({
    where,
    attributes: [
      "stage",
      [fn("COUNT", col("id")), "count"],
      [fn("SUM", col("value")), "value"],
    ],
    group: ["stage"],
    raw: true,
  });

  const byStage = new Map(rows.map((r) => [r.stage, r]));
  const totalValue =
    rows.reduce((sum, r) => sum + Number(r.value || 0), 0) || 1;

  return OPPORTUNITY_STAGE_ORDER.filter((s) => s !== "Closed Lost").map(
    (stage) => {
      const row = byStage.get(stage);
      const value = row ? Number(row.value || 0) : 0;
      return {
        name: stage,
        stage,
        value,
        count: row ? Number(row.count) : 0,
        percent: Math.round((value / totalValue) * 100),
      };
    }
  );
}

router.get("/dashboard", protect, async (req, res, next) => {
  try {
    const where = companyScope(req);
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const startOfThisYear = new Date(now.getFullYear(), 0, 1);
    const startOfLastYear = new Date(now.getFullYear() - 1, 0, 1);
    const startOfLastYearEnd = new Date(now.getFullYear(), 0, 1);

    const [
      totalRevenue,
      revenueThisYear,
      revenueLastYear,
      wonDeals,
      wonDealsThisMonth,
      wonDealsLastMonth,
      employees,
      openTickets,
      openTicketsLastWeek,
      openTicketsThisWeek,
    ] = await Promise.all([
      LedgerEntry.sum("credit", { where: { ...where, type: "credit" } }),
      LedgerEntry.sum("credit", {
        where: { ...where, type: "credit", date: { [Op.gte]: startOfThisYear } },
      }),
      LedgerEntry.sum("credit", {
        where: {
          ...where,
          type: "credit",
          date: { [Op.gte]: startOfLastYear, [Op.lt]: startOfLastYearEnd },
        },
      }),
      Opportunity.count({ where: { ...where, stage: "Closed Won" } }),
      Opportunity.count({
        where: {
          ...where,
          stage: "Closed Won",
          updatedAt: { [Op.gte]: startOfThisMonth },
        },
      }),
      Opportunity.count({
        where: {
          ...where,
          stage: "Closed Won",
          updatedAt: { [Op.gte]: startOfLastMonth, [Op.lt]: startOfThisMonth },
        },
      }),
      Employee.count({ where }),
      Ticket.count({ where: { ...where, status: "Open" } }),
      Ticket.count({
        where: {
          ...where,
          status: "Open",
          createdAt: {
            [Op.gte]: new Date(now.getTime() - 14 * 86400000),
            [Op.lt]: new Date(now.getTime() - 7 * 86400000),
          },
        },
      }),
      Ticket.count({
        where: {
          ...where,
          status: "Open",
          createdAt: { [Op.gte]: new Date(now.getTime() - 7 * 86400000) },
        },
      }),
    ]);

    const pctChange = (current, previous) => {
      if (!previous) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 1000) / 10;
    };

    const [pipeline, leadSources] = await Promise.all([
      computePipeline(where),
      computeLeadSources(where),
    ]);

    res.json({
      totalRevenue: totalRevenue || 0,
      revenueGrowth: pctChange(revenueThisYear || 0, revenueLastYear || 0),

      wonDeals,
      dealsGrowth: pctChange(wonDealsThisMonth, wonDealsLastMonth),

      employees,

      openTickets,
      ticketChange: pctChange(openTicketsThisWeek, openTicketsLastWeek),

      pipeline,
      leadSources,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/revenue-by-month", protect, async (req, res, next) => {
  try {
    const where = companyScope(req);
    const year = Number(req.query.year) || new Date().getFullYear();

    const revenue = await LedgerEntry.findAll({
      where: {
        ...where,
        type: "credit",
        date: { [Op.between]: yearRange(year) },
      },
      attributes: [
        [fn("MONTH", col("date")), "month"],
        [fn("SUM", col("credit")), "revenue"],
      ],
      group: [fn("MONTH", col("date"))],
      raw: true,
    });

    res.json({ data: zeroFillMonths(revenue, ["revenue"]) });
  } catch (err) {
    next(err);
  }
});

router.get("/sales", protect, async (req, res, next) => {
  try {
    const where = companyScope(req);
    const { startDate, endDate } = req.query;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate);
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

    const byStage = new Map(stages.map((s) => [s.stage, s]));

    res.json({
      data: OPPORTUNITY_STAGE_ORDER.map((stage) => {
        const row = byStage.get(stage);
        return {
          stage,
          count: row ? Number(row.count) : 0,
          value: row ? Number(row.value || 0) : 0,
        };
      }),
    });
  } catch (err) {
    next(err);
  }
});

router.get("/deals-won-lost", protect, async (req, res, next) => {
  try {
    const where = companyScope(req);
    const year = Number(req.query.year) || new Date().getFullYear();

    const rows = await Opportunity.findAll({
      where: {
        ...where,
        stage: { [Op.in]: ["Closed Won", "Closed Lost"] },
        updatedAt: { [Op.between]: yearRange(year) },
      },
      attributes: [
        [fn("MONTH", col("updatedAt")), "month"],
        "stage",
        [fn("COUNT", col("id")), "count"],
        [fn("SUM", col("value")), "value"],
      ],
      group: [fn("MONTH", col("updatedAt")), "stage"],
      raw: true,
    });

    const byMonth = new Map();
    rows.forEach((r) => {
      const m = Number(r.month);
      if (!byMonth.has(m)) byMonth.set(m, {});
      byMonth.get(m)[r.stage] = { count: Number(r.count), value: Number(r.value || 0) };
    });

    const data = Array.from({ length: 12 }, (_, i) => {
      const m = i + 1;
      const won = byMonth.get(m)?.["Closed Won"] || { count: 0, value: 0 };
      const lost = byMonth.get(m)?.["Closed Lost"] || { count: 0, value: 0 };
      return {
        month: MONTHS[m],
        won: won.count,
        lost: lost.count,
        wonValue: won.value,
        lostValue: lost.value,
      };
    });

    res.json({ data });
  } catch (err) {
    next(err);
  }
});

async function buildFunnel(where) {
  const rows = await Lead.findAll({
    where,
    attributes: ["stage", [fn("COUNT", col("id")), "count"]],
    group: ["stage"],
    raw: true,
  });

  const byStage = new Map(rows.map((r) => [r.stage, Number(r.count)]));

  return LEAD_FUNNEL_ORDER.map((stage) => ({
    stage,
    count: byStage.get(stage) || 0,
  }));
}

router.get("/sales-funnel", protect, async (req, res, next) => {
  try {
    res.json({ data: await buildFunnel(companyScope(req)) });
  } catch (err) {
    next(err);
  }
});

router.get("/leads-funnel", protect, async (req, res, next) => {
  try {
    const funnel = await buildFunnel(companyScope(req));
    res.json(funnel.map(({ stage, count }) => ({ stage, count })));
  } catch (err) {
    next(err);
  }
});

router.get("/sales-forecast", protect, async (req, res, next) => {
  try {
    const where = companyScope(req);

    const forecast = await Opportunity.findAll({
      where: {
        ...where,
        stage: { [Op.notIn]: ["Closed Lost", "Closed Won"] },
        closeDate: { [Op.ne]: null },
      },
      attributes: [
        [fn("MONTH", col("closeDate")), "month"],
        [
          sequelize.literal("SUM(`value` * `probability` / 100)"),
          "forecast",
        ],
      ],
      group: [fn("MONTH", col("closeDate"))],
      raw: true,
    });

    res.json({ data: zeroFillMonths(forecast, ["forecast"]) });
  } catch (err) {
    next(err);
  }
});

router.get("/expenses-analysis", protect, async (req, res, next) => {
  try {
    const where = companyScope(req);
    const year = Number(req.query.year) || new Date().getFullYear();

    const baseWhere = {
      ...where,
      status: "approved",
      date: { [Op.between]: yearRange(year) },
    };

    const [monthly, byCategory] = await Promise.all([
      Expense.findAll({
        where: baseWhere,
        attributes: [
          [fn("MONTH", col("date")), "month"],
          [fn("SUM", col("amount")), "total"],
        ],
        group: [fn("MONTH", col("date"))],
        raw: true,
      }),
      Expense.findAll({
        where: baseWhere,
        attributes: ["category", [fn("SUM", col("amount")), "total"]],
        group: ["category"],
        raw: true,
      }),
    ]);

    const totalSpend =
      byCategory.reduce((sum, c) => sum + Number(c.total || 0), 0) || 1;

    res.json({
      data: zeroFillMonths(monthly, ["total"]),
      categories: byCategory
        .map((c) => ({
          category: c.category || "Other",
          total: Number(c.total || 0),
          percent: Math.round((Number(c.total || 0) / totalSpend) * 100),
        }))
        .sort((a, b) => b.total - a.total),
    });
  } catch (err) {
    next(err);
  }
});

router.get("/employee-analytics", protect, async (req, res, next) => {
  try {
    const where = companyScope(req);

    const [byDepartment, byStatus, total] = await Promise.all([
      Employee.findAll({
        where,
        attributes: ["department", [fn("COUNT", col("id")), "count"]],
        group: ["department"],
        raw: true,
      }),
      Employee.findAll({
        where,
        attributes: ["status", [fn("COUNT", col("id")), "count"]],
        group: ["status"],
        raw: true,
      }),
      Employee.count({ where }),
    ]);

    res.json({
      data: {
        total,
        byDepartment: byDepartment
          .map((d) => ({ department: d.department || "Unassigned", count: Number(d.count) }))
          .sort((a, b) => b.count - a.count),
        byStatus: byStatus.map((s) => ({ status: s.status, count: Number(s.count) })),
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get("/inventory-analytics", protect, async (req, res, next) => {
  try {
    const where = companyScope(req);

    const [byCategory, items, totalItems] = await Promise.all([
      InventoryItem.findAll({
        where,
        attributes: [
          "category",
          [fn("SUM", sequelize.literal("`quantity` * `unitPrice`")), "value"],
          [fn("SUM", col("quantity")), "quantity"],
        ],
        group: ["category"],
        raw: true,
      }),
      InventoryItem.findAll({
        where: { ...where, [Op.and]: sequelize.literal("`quantity` <= `reorderPoint`") },
        attributes: ["id", "name", "sku", "quantity", "reorderPoint", "category"],
        limit: 25,
        raw: true,
      }),
      InventoryItem.count({ where }),
    ]);

    const totalValue = byCategory.reduce((sum, c) => sum + Number(c.value || 0), 0);

    res.json({
      data: {
        totalItems,
        totalValue,
        lowStockCount: items.length,
        lowStock: items,
        byCategory: byCategory
          .map((c) => ({
            category: c.category || "Uncategorized",
            value: Number(c.value || 0),
            quantity: Number(c.quantity || 0),
          }))
          .sort((a, b) => b.value - a.value),
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get("/support-analytics", protect, async (req, res, next) => {
  try {
    const where = companyScope(req);
    const year = Number(req.query.year) || new Date().getFullYear();

    const [byStatus, byPriority, monthly, resolvedCount, totalCount] = await Promise.all([
      Ticket.findAll({
        where,
        attributes: ["status", [fn("COUNT", col("id")), "count"]],
        group: ["status"],
        raw: true,
      }),
      Ticket.findAll({
        where,
        attributes: ["priority", [fn("COUNT", col("id")), "count"]],
        group: ["priority"],
        raw: true,
      }),
      Ticket.findAll({
        where: { ...where, createdAt: { [Op.between]: yearRange(year) } },
        attributes: [
          [fn("MONTH", col("createdAt")), "month"],
          [fn("COUNT", col("id")), "count"],
        ],
        group: [fn("MONTH", col("createdAt"))],
        raw: true,
      }),
      Ticket.count({ where: { ...where, status: { [Op.in]: ["Resolved", "Closed"] } } }),
      Ticket.count({ where }),
    ]);

    res.json({
      data: {
        byStatus: byStatus.map((s) => ({ status: s.status, count: Number(s.count) })),
        byPriority: byPriority.map((p) => ({ priority: p.priority, count: Number(p.count) })),
        monthly: zeroFillMonths(monthly, ["count"]),
        resolutionRate: totalCount ? Math.round((resolvedCount / totalCount) * 100) : 0,
        totalCount,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get("/lead-source-analytics", protect, async (req, res, next) => {
  try {
    res.json({ data: await computeLeadSources(companyScope(req)) });
  } catch (err) {
    next(err);
  }
});

router.get("/financial", protect, async (req, res, next) => {
  try {
    const where = companyScope(req);
    const year = Number(req.query.year) || new Date().getFullYear();

    const [expenses, revenue] = await Promise.all([
      Expense.findAll({
        where: {
          ...where,
          status: "approved",
          date: { [Op.between]: yearRange(year) },
        },
        attributes: [
          [fn("MONTH", col("date")), "month"],
          [fn("SUM", col("amount")), "total"],
        ],
        group: [fn("MONTH", col("date"))],
        raw: true,
      }),
      LedgerEntry.findAll({
        where: {
          ...where,
          type: "credit",
          date: { [Op.between]: yearRange(year) },
        },
        attributes: [
          [fn("MONTH", col("date")), "month"],
          [fn("SUM", col("credit")), "total"],
        ],
        group: [fn("MONTH", col("date"))],
        raw: true,
      }),
    ]);

    res.json({
      expenses: zeroFillMonths(expenses, ["total"]),
      revenue: zeroFillMonths(revenue, ["total"]),
    });
  } catch (err) {
    next(err);
  }
});

export default router;