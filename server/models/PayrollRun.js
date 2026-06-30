import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/db.js'

class PayrollRun extends Model {}

PayrollRun.init({
  id:             { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  companyId:      { type: DataTypes.UUID, allowNull: true },
  period:         { type: DataTypes.STRING, allowNull: false },
  employeeCount:  { type: DataTypes.INTEGER, defaultValue: 0 },
  grossPay:       { type: DataTypes.FLOAT, defaultValue: 0 },
  deductions:     { type: DataTypes.FLOAT, defaultValue: 0 },
  netPay:         { type: DataTypes.FLOAT, defaultValue: 0 },
  status: {
    type: DataTypes.ENUM('draft','processing','processed','approved','paid'),
    defaultValue: 'draft',
  },
  processedById:  { type: DataTypes.UUID, allowNull: true },
  processedAt:    { type: DataTypes.DATE },
  approvedById:   { type: DataTypes.UUID, allowNull: true },
  approvedAt:     { type: DataTypes.DATE },
}, {
  sequelize,
  modelName: 'PayrollRun',
  tableName: 'payroll_runs',
  timestamps: true,
})

export default PayrollRun
