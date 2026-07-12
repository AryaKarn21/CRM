import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";

class Asset extends Model {}

Asset.init(
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

    assetCode: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    category: {
      type: DataTypes.STRING,
    },

    brand: {
      type: DataTypes.STRING,
    },

    model: {
      type: DataTypes.STRING,
    },

    serialNumber: {
      type: DataTypes.STRING,
    },

    warehouseId: {
      type: DataTypes.UUID,
      allowNull: true,
    },

    assignedToId: {
      type: DataTypes.UUID,
      allowNull: true,
    },

    purchaseDate: {
      type: DataTypes.DATEONLY,
    },

    purchasePrice: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },

    currentValue: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },

    depreciation: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },

    warrantyExpiry: {
      type: DataTypes.DATEONLY,
    },

    status: {
      type: DataTypes.ENUM(
        "available",
        "assigned",
        "maintenance",
        "lost",
        "damaged",
        "retired"
      ),
      defaultValue: "available",
    },

    description: {
      type: DataTypes.TEXT,
    },
  },
  {
    sequelize,
    modelName: "Asset",
    tableName: "assets",
    timestamps: true,
  }
);

export default Asset;