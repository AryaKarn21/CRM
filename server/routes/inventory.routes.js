import express from "express";
import { Op, col } from "sequelize";
import { InventoryItem, Warehouse, Asset, Employee } from "../models/index.js";
import { protect } from "../middleware/auth.js";
;
const router = express.Router();
const getCompany = (req) => req.companyId;

router.get("/items", protect, async (req, res, next) => {
  try {
    const company = getCompany(req);
    const { page = 1, limit = 20, search, category, lowStock } = req.query;
    const where = { companyId: company };
    if (category) where.category = category;
    if (search) where.name = { [Op.like]: `%${search}%` };
    if (lowStock === "true") where.quantity = { [Op.lte]: col("reorderPoint") };

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { rows: items, count: total } = await InventoryItem.findAndCountAll({
      where,
      order: [["createdAt", "DESC"]],
      offset,
      limit: parseInt(limit),
      include: [
        { model: Warehouse, as: "warehouse", attributes: ["id", "name"] },
      ],
    });
    res.json({ items, total });
  } catch (err) {
    next(err);
  }
});

router.post("/items", protect, async (req, res, next) => {
  try {
    const item = await InventoryItem.create({
      ...req.body,
      companyId: getCompany(req),
    });
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

router.patch("/items/:id", protect, async (req, res, next) => {
  try {
    const item = await InventoryItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    await item.update(req.body);
    res.json(item);
  } catch (err) {
    next(err);
  }
});

router.delete("/items/:id", protect, async (req, res, next) => {
  try {
    await InventoryItem.destroy({ where: { id: req.params.id } });
    res.json({ message: "Item deleted" });
  } catch (err) {
    next(err);
  }
});

// ── Warehouses ────────────────────────────────────────────
router.get("/warehouses", protect, async (req, res, next) => {
  try {
    const warehouses = await Warehouse.findAll({
      where: { companyId: getCompany(req) },
    });
    res.json(warehouses);
  } catch (err) {
    next(err);
  }
});

router.get("/warehouses/:id", protect, async (req, res, next) => {
  try {
    const warehouse = await Warehouse.findByPk(req.params.id);

    if (!warehouse) {
      return res.status(404).json({
        message: "Warehouse not found",
      });
    }

    res.json(warehouse);
  } catch (err) {
    next(err);
  }
});

router.post("/warehouses", protect, async (req, res, next) => {
  try {
    const warehouse = await Warehouse.create({
      ...req.body,
      companyId: getCompany(req),
    });
    res.status(201).json(warehouse);
  } catch (err) {
    next(err);
  }
});

router.patch("/warehouses/:id", protect, async (req, res, next) => {
  try {
    const warehouse = await Warehouse.findByPk(req.params.id);

    if (!warehouse) {
      return res.status(404).json({
        message: "Warehouse not found",
      });
    }

    await warehouse.update(req.body);

    res.json(warehouse);
  } catch (err) {
    next(err);
  }
});

router.delete("/warehouses/:id", protect, async (req, res, next) => {
  try {
    const warehouse = await Warehouse.findByPk(req.params.id);

    if (!warehouse) {
      return res.status(404).json({
        message: "Warehouse not found",
      });
    }

    await warehouse.destroy();

    res.json({
      message: "Warehouse deleted",
    });
  } catch (err) {
    next(err);
  }
});

// ── Assets ────────────────────────────────────────────────
router.get("/assets", protect, async (req, res) => {
  try {
    const company = getCompany(req);

    const assets = await Asset.findAll({
      where: {
        companyId: company,
      },

      include: [
        {
          model: Warehouse,
          as: "warehouse",
          attributes: ["id", "name"],
          required: false,
        },
        {
          model: Employee,
          as: "assignedTo",
          attributes: ["id", "firstName", "lastName"],
          required: false,
        },
      ],

      order: [["createdAt", "DESC"]],
    });

    res.json(assets);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: err.message,
    });
  }
});
router.get("/assets/:id", protect, async (req, res, next) => {
  try {
    const asset = await Asset.findByPk(req.params.id);

    if (!asset) {
      return res.status(404).json({
        message: "Asset not found",
      });
    }

    res.json(asset);
  } catch (err) {
    next(err);
  }
});

router.post("/assets", protect, async (req, res, next) => {
  try {
    const asset = await Asset.create({
      ...req.body,
      companyId: getCompany(req),
    });
    res.status(201).json(asset);
  } catch (err) {
    next(err);
  }
});

router.patch("/assets/:id", protect, async (req, res, next) => {
  try {
    const asset = await Asset.findByPk(req.params.id);
    if (!asset) return res.status(404).json({ message: "Asset not found" });
    await asset.update(req.body);
    res.json(asset);
  } catch (err) {
    next(err);
  }
});

router.delete("/assets/:id", protect, async (req, res, next) => {
  try {
    const asset = await Asset.findByPk(req.params.id);

    if (!asset) {
      return res.status(404).json({
        message: "Asset not found",
      });
    }

    await asset.destroy();

    res.json({
      message: "Asset deleted successfully",
    });
  } catch (err) {
    next(err);
  }
});

// ── Stock Transfers ───────────────────────────────────────
router.get("/transfers", protect, async (req, res) => {
  try {
    const transfers = await StockTransfer.findAll({
      where: {
        companyId: getCompany(req),
      },

      include: [
        {
          model: InventoryItem,
          as: "item",
          attributes: ["id", "name", "sku"],
        },
        {
          model: Warehouse,
          as: "fromWarehouse",
          attributes: ["id", "name"],
        },
        {
          model: Warehouse,
          as: "toWarehouse",
          attributes: ["id", "name"],
        },
        {
          model: User,
          as: "createdBy",
          attributes: ["id", "name", "email"],
          required: false,
        },
      ],

      order: [["createdAt", "DESC"]],
    });

    res.json(transfers);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: err.message,
    });
  }
});

router.get("/transfers/:id", protect, async (req, res) => {
  try {
    const transfer = await StockTransfer.findByPk(req.params.id);

    if (!transfer) {
      return res.status(404).json({
        message: "Transfer not found",
      });
    }

    res.json(transfer);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

router.post("/transfers", protect, async (req, res) => {
  try {
    const {
      itemId,
      fromWarehouseId,
      toWarehouseId,
      quantity,
      transferDate,
      referenceNo,
      remarks,
    } = req.body;

    if (fromWarehouseId === toWarehouseId) {
      return res.status(400).json({
        message: "Source and destination warehouse cannot be the same.",
      });
    }

    const item = await InventoryItem.findByPk(itemId);

    if (!item) {
      return res.status(404).json({
        message: "Inventory item not found",
      });
    }

    if (item.quantity < quantity) {
      return res.status(400).json({
        message: "Insufficient stock.",
      });
    }

    // Deduct stock
    item.quantity -= Number(quantity);

    await item.save();

    const transfer = await StockTransfer.create({
      companyId: getCompany(req),

      itemId,

      fromWarehouseId,

      toWarehouseId,

      quantity,

      transferDate,

      referenceNo,

      remarks,

      createdById: req.user.id,

      status: "Completed",
    });

    res.status(201).json(transfer);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: err.message,
    });
  }
});


router.delete("/transfers/:id", protect, async (req, res) => {
  try {
    const transfer = await StockTransfer.findByPk(req.params.id);

    if (!transfer) {
      return res.status(404).json({
        message: "Transfer not found",
      });
    }

    await transfer.destroy();

    res.json({
      message: "Transfer deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

export default router;
