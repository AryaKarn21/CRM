import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";

class StockTransfer extends Model {}

StockTransfer.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    companyId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    itemId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    fromWarehouseId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    toWarehouseId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    quantity: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 1,
    },

    transferDate: {
      type: DataTypes.DATEONLY,
      defaultValue: DataTypes.NOW,
    },

    referenceNo: {
      type: DataTypes.STRING,
    },

    remarks: {
      type: DataTypes.TEXT,
    },

    status: {
      type: DataTypes.ENUM(
        "Pending",
        "Approved",
        "Completed",
        "Cancelled"
      ),
      defaultValue: "Pending",
    },

    createdById: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "StockTransfer",
    tableName: "stock_transfers",
    timestamps: true,
  }
);

export default StockTransfer;