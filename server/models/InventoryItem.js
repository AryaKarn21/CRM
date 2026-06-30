import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/db.js'

class InventoryItem extends Model {}

InventoryItem.init({
  id:              { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  companyId:       { type: DataTypes.UUID, allowNull: true },
  name:            { type: DataTypes.STRING, allowNull: false },
  sku:             { type: DataTypes.STRING },
  category:        { type: DataTypes.STRING },
  unit:            { type: DataTypes.STRING, defaultValue: 'pcs' },
  quantity:        { type: DataTypes.FLOAT, defaultValue: 0 },
  unitPrice:       { type: DataTypes.FLOAT, defaultValue: 0 },
  reorderPoint:    { type: DataTypes.FLOAT, defaultValue: 0 },
  valuationMethod: {
    type: DataTypes.ENUM('FIFO','LIFO','Weighted Average'),
    defaultValue: 'FIFO',
  },
  warehouseId:     { type: DataTypes.UUID, allowNull: true },
  description:     { type: DataTypes.TEXT },
}, {
  sequelize,
  modelName: 'InventoryItem',
  tableName: 'inventory_items',
  timestamps: true,
})

export default InventoryItem
