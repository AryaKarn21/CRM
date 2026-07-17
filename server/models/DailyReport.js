import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";

class DailyReport extends Model {}

DailyReport.init(
  {
    id:            { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    companyId:     { type: DataTypes.UUID, allowNull: false },
    employeeId:    { type: DataTypes.UUID, allowNull: false },
    reportDate:    { type: DataTypes.DATEONLY, allowNull: false },
    title:         { type: DataTypes.STRING },
    content:       { type: DataTypes.TEXT, allowNull: false },
    hoursSpent:    { type: DataTypes.FLOAT, defaultValue: 0 },
    blockers:      { type: DataTypes.TEXT },
    submittedById: { type: DataTypes.UUID }, // the user who submitted it
  },
  {
    sequelize,
    modelName: "DailyReport",
    tableName: "daily_reports",
    timestamps: true,
    indexes: [
      { fields: ["companyId", "employeeId", "reportDate"] },
      { fields: ["employeeId"] },
    ],
  }
);

export default DailyReport;