import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/db.js'

class Project extends Model {}

Project.init({
  id:          { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  companyId:   { type: DataTypes.UUID, allowNull: true },
  name:        { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  client:      { type: DataTypes.STRING },
  startDate:   { type: DataTypes.DATEONLY },
  endDate:     { type: DataTypes.DATEONLY },
  budget:      { type: DataTypes.FLOAT },
  status: {
    type: DataTypes.ENUM('active','on_hold','completed','cancelled'),
    defaultValue: 'active',
  },
  progress:    { type: DataTypes.INTEGER, defaultValue: 0, validate: { min: 0, max: 100 } },
  managerId:   { type: DataTypes.UUID, allowNull: true },
}, {
  sequelize,
  modelName: 'Project',
  tableName: 'projects',
  timestamps: true,
})

export default Project
