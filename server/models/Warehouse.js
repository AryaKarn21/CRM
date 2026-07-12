import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/db.js'

class Warehouse extends Model {}

Warehouse.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  companyId: {
    type: DataTypes.UUID,
    allowNull: false,
  },

  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  code: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  location: {
    type: DataTypes.STRING,
  },

  managerId: {
    type: DataTypes.UUID,
    allowNull: true,
  },

  phone: {
    type: DataTypes.STRING,
  },

  email: {
    type: DataTypes.STRING,
  },

  capacity: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },

  description: {
    type: DataTypes.TEXT,
  },

  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  sequelize,
  modelName: 'Warehouse',
  tableName: 'warehouses',
  timestamps: true,
})

export default Warehouse
