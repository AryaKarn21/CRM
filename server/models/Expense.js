import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";

class Expense extends Model {}

Expense.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    companyId: { type: DataTypes.UUID, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    amount: { type: DataTypes.FLOAT, allowNull: false },
    category: { type: DataTypes.STRING, allowNull: false },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    description: { type: DataTypes.TEXT },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
    },
    submittedById: { type: DataTypes.UUID, allowNull: true },
    approvedById: { type: DataTypes.UUID, allowNull: true },
    approvedAt: { type: DataTypes.DATE },
    rejectionReason: { type: DataTypes.TEXT },
    receipt: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    receiptOriginalName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    receiptMimeType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    receiptSize: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    receiptUploadedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    receiptUploadedById: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Expense",
    tableName: "expenses",
    timestamps: true,
    indexes: [
      { fields: ["companyId", "status"] },
      { fields: ["companyId", "date"] },
    ],
  },
);

export default Expense;