import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/db.js'

// Replaces Employee.documents embedded array.
class EmployeeDocument extends Model {}

EmployeeDocument.init({
  id:         { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  employeeId: { type: DataTypes.UUID, allowNull: false },
  name:       { type: DataTypes.STRING },
  url:        { type: DataTypes.STRING },
  uploadedAt: { type: DataTypes.DATE },
}, {
  sequelize,
  modelName: 'EmployeeDocument',
  tableName: 'employee_documents',
  timestamps: false,
})

export default EmployeeDocument
