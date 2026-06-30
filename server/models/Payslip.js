import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/db.js'

class Payslip extends Model {}

Payslip.init({
  id:           { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  companyId:    { type: DataTypes.UUID, allowNull: false },
  employeeId:   { type: DataTypes.UUID, allowNull: false },
  payrollRunId: { type: DataTypes.UUID, allowNull: false },
  period:       { type: DataTypes.STRING, allowNull: false },
  basicSalary:  { type: DataTypes.FLOAT, defaultValue: 0 },
  allowances:   { type: DataTypes.FLOAT, defaultValue: 0 },
  deductions:   { type: DataTypes.FLOAT, defaultValue: 0 },
  tax:          { type: DataTypes.FLOAT, defaultValue: 0 },
  netPay:       { type: DataTypes.FLOAT, defaultValue: 0 },
  grossPay:     { type: DataTypes.FLOAT, defaultValue: 0 },
  processedAt:  { type: DataTypes.DATE },
}, {
  sequelize,
  modelName: 'Payslip',
  tableName: 'payslips',
  timestamps: true,
})

export default Payslip
