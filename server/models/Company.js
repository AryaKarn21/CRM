import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/db.js'

class Company extends Model { }

Company.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  type: { type: DataTypes.STRING, defaultValue: 'Company' },
  industry: { type: DataTypes.STRING },
  website: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING },
  phone: { type: DataTypes.STRING },
  address: { type: DataTypes.STRING },
  currency: { type: DataTypes.STRING, defaultValue: 'NPR' },
  timezone: { type: DataTypes.STRING, defaultValue: 'Asia/Kathmandu' },
  logo: { type: DataTypes.STRING },
  parentId: { type: DataTypes.UUID, allowNull: true },

  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },

}, {
  sequelize,
  modelName: 'Company',
  tableName: 'companies',
  timestamps: true, // adds createdAt / updatedAt automatically
})

export default Company
