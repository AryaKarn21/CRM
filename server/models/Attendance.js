import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/db.js'

class Attendance extends Model {}

Attendance.init({
  id:          { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  companyId:   { type: DataTypes.UUID, allowNull: true },
  employeeId:  { type: DataTypes.UUID, allowNull: false },
  date:        { type: DataTypes.DATEONLY, allowNull: false },
  checkIn:     { type: DataTypes.DATE },
  checkOut:    { type: DataTypes.DATE },
  hoursWorked: { type: DataTypes.FLOAT },
  status: {
    type: DataTypes.ENUM('present','absent','late','half_day','holiday'),
    defaultValue: 'present',
  },
  shiftId:     { type: DataTypes.UUID, allowNull: true },
  notes:       { type: DataTypes.TEXT },
}, {
  sequelize,
  modelName: 'Attendance',
  tableName: 'attendance',
  timestamps: true,
  indexes: [
    { fields: ['companyId', 'date'] },
    { fields: ['employeeId', 'date'] },
  ],
})

export default Attendance
