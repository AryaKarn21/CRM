import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/db.js'

class LeaveType extends Model {}

LeaveType.init({
  id:          { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  companyId:   { type: DataTypes.UUID, allowNull: false },
  name:        { type: DataTypes.STRING, allowNull: false },
  daysAllowed: { type: DataTypes.INTEGER, allowNull: false },
  isPaid:      { type: DataTypes.BOOLEAN, defaultValue: true },
  description: { type: DataTypes.TEXT },
}, {
  sequelize,
  modelName: 'LeaveType',
  tableName: 'leave_types',
  timestamps: true,
})

export default LeaveType
