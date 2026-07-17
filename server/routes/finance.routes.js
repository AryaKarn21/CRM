<<<<<<< HEAD
import express from 'express'
import { Op, fn, col } from 'sequelize'
import { Expense, LedgerEntry, User } from '../models/index.js'
import { protect } from '../middleware/auth.js'
import { requirePermission } from '../middleware/permission.js'

const router = express.Router()
const getCompany = (req) => req.headers['x-company-id'] || null

// ── Expenses ──────────────────────────────────────────────
router.get('/expenses', protect, requirePermission('finance.view'), async (req, res, next) => {
=======
import express from "express";
import { Op, fn, col } from "sequelize";
import { Expense, LedgerEntry, User, Company, } from "../models/index.js";
import { protect } from "../middleware/auth.js";
import uploadReceipt from "../middleware/uploadReceipt.js";
import Notification from "../models/Notification.js";
import { generateExpensePDF } from "../reports/expenseReport.js";
import fs from "fs";
import path from "path";

const router = express.Router();
const getCompany = (req) => req.companyId;
router.get("/expenses", protect, async (req, res, next) => {
>>>>>>> 917c8a18016c659dc45dc14a6f58371e3c6f5578
  try {
    const companyId = req.companyId;

<<<<<<< HEAD
router.post('/expenses', protect, requirePermission('finance.view'), async (req, res, next) => {
  try {
    const expense = await Expense.create({ ...req.body, companyId: getCompany(req), submittedById: req.user.id })
    res.status(201).json(expense)
  } catch (err) { next(err) }
})

router.patch('/expenses/:id/approve', protect, requirePermission('finance.view'), async (req, res, next) => {
  try {
    const expense = await Expense.findByPk(req.params.id)
    if (!expense) return res.status(404).json({ message: 'Expense not found' })
    await expense.update({ status: 'approved', approvedById: req.user.id, approvedAt: new Date() })
    res.json(expense)
  } catch (err) { next(err) }
})

router.patch('/expenses/:id/reject', protect, requirePermission('finance.view'), async (req, res, next) => {
  try {
    const expense = await Expense.findByPk(req.params.id)
    if (!expense) return res.status(404).json({ message: 'Expense not found' })
    await expense.update({ status: 'rejected', rejectionReason: req.body.reason })
    res.json(expense)
  } catch (err) { next(err) }
})

router.delete('/expenses/:id', protect, requirePermission('finance.view'), async (req, res, next) => {
  try {
    await Expense.destroy({ where: { id: req.params.id } })
    res.json({ message: 'Expense deleted' })
  } catch (err) { next(err) }
})

// ── Ledger ────────────────────────────────────────────────
router.get('/ledger', protect, requirePermission('finance.ledger.view'), async (req, res, next) => {
  try {
    const company = getCompany(req)
    const { startDate, endDate } = req.query
    const where = { companyId: company }
    if (startDate || endDate) {
      where.date = {}
      if (startDate) where.date[Op.gte] = new Date(startDate)
      if (endDate) where.date[Op.lte] = new Date(endDate)
=======
    const { page = 1, limit = 20, search = "", category, status } = req.query;

    const where = {
      companyId,
    };

    if (search) {
      where.title = {
        [Op.like]: `%${search}%`,
      };
>>>>>>> 917c8a18016c659dc45dc14a6f58371e3c6f5578
    }

<<<<<<< HEAD
router.post('/ledger', protect, requirePermission('finance.ledger.view'), async (req, res, next) => {
  try {
    const entry = await LedgerEntry.create({ ...req.body, companyId: getCompany(req), createdById: req.user.id })
    res.status(201).json(entry)
  } catch (err) { next(err) }
})

=======
    if (category) {
      where.category = category;
    }
>>>>>>> 917c8a18016c659dc45dc14a6f58371e3c6f5578

    if (status) {
      where.status = status;
    }

    const { rows, count } = await Expense.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: "submittedBy",
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["date", "DESC"]],
      limit: Number(limit),
      offset: (page - 1) * limit,
    });

    res.json({
      expenses: rows,
      total: count,
    });
  } catch (err) {
    next(err);
  }
});
router.get("/expenses/:id", protect, async (req, res, next) => {
  try {
<<<<<<< HEAD

    res.json([])

  }

  catch (err) {

    next(err)

  }

})

router.patch('/expenses/:id', protect, async (req, res, next) => {

  try {

    const expense = await Expense.findByPk(req.params.id)

    if (!expense)
      return res.status(404).json({ message: 'Expense not found' })

    await expense.update(req.body)

    res.json(expense)

  } catch (err) {

    next(err)

  }

})

router.patch('/expenses/:id', protect, async (req, res, next) => {
  try {
    const expense = await Expense.findByPk(req.params.id)
=======
    const expense = await Expense.findOne({
      where: {
        id: req.params.id,
        companyId: req.companyId,
      },
      include: [
        {
          model: User,
          as: "submittedBy",
          attributes: ["id", "name", "email"],
        },
      ],
    });
>>>>>>> 917c8a18016c659dc45dc14a6f58371e3c6f5578

    if (!expense) {
      return res.status(404).json({
        message: "Expense not found",
      });
    }

    res.json(expense);
  } catch (err) {
    next(err);
  }
});
router.post("/expenses", protect, async (req, res, next) => {
  try {
    const expense = await Expense.create({
      ...req.body,
      companyId: getCompany(req),
      submittedById: req.user.id,
    });
    res.status(201).json(expense);
  } catch (err) {
    next(err);
  }
});

router.get(
  "/expenses/:id/receipt/view",
  protect,
  async (req, res, next) => {
    try {
      const expense = await Expense.findOne({
        where: {
          id: req.params.id,
          companyId: getCompany(req),
        },
      });

      if (!expense)
        return res.status(404).json({
          message: "Expense not found",
        });

      if (!expense.receipt)
        return res.status(404).json({
          message: "Receipt not found",
        });

      return res.sendFile(
        path.resolve(process.cwd(), expense.receipt)
      );
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/expenses/:id/receipt/download",
  protect,
  async (req, res, next) => {
    try {
      const expense = await Expense.findOne({
        where: {
          id: req.params.id,
          companyId: getCompany(req),
        },
      });

      if (!expense)
        return res.status(404).json({
          message: "Expense not found",
        });

      if (!expense.receipt)
        return res.status(404).json({
          message: "Receipt not found",
        });

      return res.download(
        path.resolve(process.cwd(), expense.receipt),
        expense.receiptOriginalName || "receipt"
      );
    } catch (err) {
      next(err);
    }
  }
);



router.patch("/expenses/:id/approve", protect, async (req, res, next) => {
  try {
    const expense = await Expense.findByPk(req.params.id);
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    await expense.update({
      status: "approved",
      approvedById: req.user.id,
      approvedAt: new Date(),
    });
    res.json(expense);
  } catch (err) {
    next(err);
  }
});
router.post(
  "/expenses/:id/receipt",
  protect,
  uploadReceipt.single("receipt"),
  async (req, res, next) => {
    try {
      const expense = await Expense.findOne({
        where: {
          id: req.params.id,
          companyId: req.companyId,
        },
      });

      if (!expense) {
        return res.status(404).json({
          message: "Expense not found",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          message: "No receipt uploaded",
        });
      }

      await expense.update({
        receipt: `/uploads/receipts/${req.file.filename}`,
        receiptOriginalName: req.file.originalname,
        receiptMimeType: req.file.mimetype,
        receiptSize: req.file.size,
        receiptUploadedAt: new Date(),
      });

      res.json({
        message: "Receipt uploaded successfully",
        expense,
      });
    } catch (err) {
      next(err);
    }
  },
);

router.patch("/expenses/:id/reject", protect, async (req, res, next) => {
  try {
    const expense = await Expense.findByPk(req.params.id);
    if (!expense) return res.status(404).json({ message: "Expense not found" });

    await expense.update({
      status: "rejected",
      rejectionReason: req.body.reason,
    });

    await Notification.create({
      companyId: expense.companyId,
      userId: req.user.id,

      title: "Expense Receipt Uploaded",

      message: `${req.user.name} uploaded a receipt for expense ${
        expense.expenseNo || expense.id
      }`,

      type: "expense",

      link: `/finance/expenses/${expense.id}`,

      isRead: false,
    });
    res.json(expense);
  } catch (err) {
    next(err);
  }
});

router.delete("/expenses/:id", protect, async (req, res, next) => {
  try {
    await Expense.destroy({ where: { id: req.params.id } });
    res.json({ message: "Expense deleted" });
  } catch (err) {
    next(err);
  }
});

// ── Ledger ────────────────────────────────────────────────
router.get("/ledger", protect, async (req, res, next) => {
  try {
    const company = getCompany(req);
    const { startDate, endDate } = req.query;
    const where = { companyId: company };
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date[Op.gte] = new Date(startDate);
      if (endDate) where.date[Op.lte] = new Date(endDate);
    }
    const entries = await LedgerEntry.findAll({
      where,
      order: [["date", "ASC"]],
    });
    res.json(entries);
  } catch (err) {
    next(err);
  }
});

router.post("/ledger", protect, async (req, res, next) => {
  try {
    const entry = await LedgerEntry.create({
      ...req.body,
      companyId: getCompany(req),
      createdById: req.user.id,
    });
    res.status(201).json(entry);
  } catch (err) {
    next(err);
  }
});

// ── Summary ───────────────────────────────────────────────
router.get("/summary", protect, async (req, res, next) => {
  try {
    const company = getCompany(req);
    const [totalExpenses, byCategory] = await Promise.all([
      Expense.sum("amount", {
        where: { companyId: company, status: "approved" },
      }),
      Expense.findAll({
        where: { companyId: company, status: "approved" },
        attributes: ["category", [fn("SUM", col("amount")), "total"]],
        group: ["category"],
        raw: true,
      }),
    ]);
    res.json({
      totalExpenses: totalExpenses || 0,
      byCategory: byCategory.map((c) => ({
        _id: c.category,
        total: Number(c.total),
      })),
    });
  } catch (err) {
    next(err);
  }
});
router.get("/overview", protect, async (req, res, next) => {
  try {
    const company = req.companyId;

    const totalExpenses = await Expense.sum("amount", {
      where: { companyId: company },
    });

    const totalEntries = await LedgerEntry.count({
      where: { companyId: company },
    });

    res.json({
      totalExpenses: totalExpenses || 0,
      totalLedgerEntries: totalEntries || 0,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/reports/revenue-by-month", protect, async (req, res, next) => {
  try {
    res.json([]);
  } catch (err) {
    next(err);
  }
});

router.patch("/expenses/:id", protect, async (req, res, next) => {
  try {
    const expense = await Expense.findByPk(req.params.id);

    if (!expense) return res.status(404).json({ message: "Expense not found" });

    await expense.update(req.body);

    res.json(expense);
  } catch (err) {
    next(err);
  }
});

router.patch("/expenses/:id", protect, async (req, res, next) => {
  try {
    const expense = await Expense.findByPk(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    await expense.update(req.body);

    res.json(expense);
  } catch (err) {
    next(err);
  }
});

router.post(
  "/expenses/:id/receipt",
  protect,
  uploadReceipt.single("receipt"),
  async (req, res, next) => {
    try {
      const expense = await Expense.findByPk(req.params.id);

      if (!expense) {
        return res.status(404).json({
          message: "Expense not found",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          message: "No file uploaded",
        });
      }

      await expense.update({
        receipt: `/uploads/receipts/${req.file.filename}`,

        receiptOriginalName: req.file.originalname,

        receiptMimeType: req.file.mimetype,

        receiptSize: req.file.size,

        receiptUploadedAt: new Date(),

        receiptUploadedById: req.user.id,
      });

      res.json({
        message: "Receipt uploaded successfully",
        expense,
      });
    } catch (err) {
      next(err);
    }
  },
);

router.delete("/expenses/:id/receipt", protect, async (req, res, next) => {
  try {
    const expense = await Expense.findByPk(req.params.id);

    if (!expense) {
      return res.status(404).json({
        message: "Expense not found",
      });
    }

    if (expense.receipt) {
      const filePath = path.join(
        process.cwd(),
        expense.receipt.replace(/^\//, ""),
      );

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await expense.update({
      receipt: null,
      receiptOriginalName: null,
      receiptMimeType: null,
      receiptSize: null,
    });

    res.json({
      message: "Receipt deleted successfully",
    });
  } catch (err) {
    next(err);
  }
});

router.get("/expenses/:id/download", protect, async (req, res, next) => {
  try {
    const expense = await Expense.findByPk(req.params.id);

    if (!expense) {
      return res.status(404).json({
        message: "Expense not found",
      });
    }

    // Company Security
    if (
      req.user.role !== "super_admin" &&
      expense.companyId !== req.companyId
    ) {
      return res.status(403).json({
        message: "You are not authorized to download this receipt.",
      });
    }

    if (!expense.receipt) {
      return res.status(404).json({
        message: "Receipt not uploaded.",
      });
    }

    const filePath = path.join(
      process.cwd(),
      expense.receipt.replace(/^\//, ""),
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        message: "Receipt file not found.",
      });
    }

    return res.download(filePath, expense.receiptOriginalName || "receipt");
  } catch (err) {
    next(err);
  }
});

router.get(
  "/expenses/:id/report",
  protect,
  async (req, res, next) => {
    try {
      const expense = await Expense.findOne({
        where: {
          id: req.params.id,
          companyId: req.companyId,
        },

        include: [
          {
            model: User,
            as: "submittedBy",
            attributes: ["id", "name", "email"],
          },
          {
            model: User,
            as: "approvedBy",
            attributes: ["id", "name", "email"],
            required: false,
          },
          {
            model: Company,
            as: "company",
            attributes: ["id", "name"],
          },
        ],
      });

      if (!expense) {
        return res.status(404).json({
          message: "Expense not found",
        });
      }

      generateExpensePDF(expense, res);

    } catch (err) {
      next(err);
    }
  }
);

export default router;
