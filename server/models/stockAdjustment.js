import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";

class StockAdjustment extends Model {}

StockAdjustment.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    adjustmentNo: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    companyId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    itemId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    warehouseId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    type: {
      type: DataTypes.ENUM("Increase", "Decrease"),
      allowNull: false,
    },

    quantity: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 1,
    },

    reason: {
      type: DataTypes.ENUM(
        "Damaged",
        "Lost",
        "Expired",
        "Returned",
        "Manual Correction",
        "Initial Stock",
        "Other"
      ),
      defaultValue: "Manual Correction",
    },

    remarks: {
      type: DataTypes.TEXT,
    },

    createdById: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "StockAdjustment",
    tableName: "stock_adjustments",
    timestamps: true,
  }
);

export default StockAdjustment;