import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/db.js'

class Employee extends Model {}

Employee.init({
  id:          { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  companyId:   { type: DataTypes.UUID, allowNull: true },
  userId:      { type: DataTypes.UUID, allowNull: true },
  employeeId:  { type: DataTypes.STRING },
  firstName:   { type: DataTypes.STRING, allowNull: false },
  lastName:    { type: DataTypes.STRING, allowNull: false },
  email:       { type: DataTypes.STRING, allowNull: false },
  phone:       { type: DataTypes.STRING },
  department:  { type: DataTypes.STRING, allowNull: false },
  designation: { type: DataTypes.STRING, allowNull: false },
  joinDate:    { type: DataTypes.DATE, allowNull: false },
  salary:      { type: DataTypes.FLOAT, allowNull: false },
  status: {
    type: DataTypes.ENUM('active','inactive','on_leave','terminated'),
    defaultValue: 'active',
  },
  avatar:      { type: DataTypes.STRING },
  address:     { type: DataTypes.STRING },
}, {
  sequelize,
  modelName: 'Employee',
  tableName: 'employees',
  timestamps: true,
  indexes: [
    { fields: ['companyId', 'department'] },
    { fields: ['companyId', 'status'] },
  ],
})

export default Employee
