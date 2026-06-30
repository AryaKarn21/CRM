import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/db.js'

class Leave extends Model {}

Leave.init({
  id:           { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  companyId:    { type: DataTypes.UUID, allowNull: true },
  employeeId:   { type: DataTypes.UUID, allowNull: false },
  leaveType:    { type: DataTypes.STRING, allowNull: false },
  startDate:    { type: DataTypes.DATEONLY, allowNull: false },
  endDate:      { type: DataTypes.DATEONLY, allowNull: false },
  days:         { type: DataTypes.INTEGER, allowNull: false },
  reason:       { type: DataTypes.TEXT, allowNull: false },
  status: {
    type: DataTypes.ENUM('pending','approved','rejected','cancelled'),
    defaultValue: 'pending',
  },
  approvedById: { type: DataTypes.UUID, allowNull: true },
  approvedAt:   { type: DataTypes.DATE },
  remarks:      { type: DataTypes.TEXT },
}, {
  sequelize,
  modelName: 'Leave',
  tableName: 'leaves',
  timestamps: true,
  indexes: [
    { fields: ['companyId', 'status'] },
    { fields: ['employeeId'] },
  ],
})

export default Leave
