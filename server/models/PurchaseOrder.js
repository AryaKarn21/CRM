import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/db.js'

class PurchaseOrder extends Model {}

PurchaseOrder.init({
  id:               { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  companyId:        { type: DataTypes.UUID, allowNull: true },
  poNumber:         { type: DataTypes.STRING, allowNull: false, unique: true },
  vendorId:         { type: DataTypes.UUID, allowNull: false },
  totalAmount:      { type: DataTypes.FLOAT, defaultValue: 0 },
  status: {
    type: DataTypes.ENUM('draft','pending','approved','received','cancelled'),
    defaultValue: 'draft',
  },
  orderDate:        { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  expectedDelivery: { type: DataTypes.DATEONLY },
  receivedDate:     { type: DataTypes.DATEONLY },
  notes:            { type: DataTypes.TEXT },
  createdById:      { type: DataTypes.UUID, allowNull: true },
  approvedById:     { type: DataTypes.UUID, allowNull: true },
}, {
  sequelize,
  modelName: 'PurchaseOrder',
  tableName: 'purchase_orders',
  timestamps: true,
})

export default PurchaseOrder
