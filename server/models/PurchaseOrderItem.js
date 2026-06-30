import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/db.js'

// Replaces PurchaseOrder.items embedded array.
class PurchaseOrderItem extends Model {}

PurchaseOrderItem.init({
  id:              { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  purchaseOrderId: { type: DataTypes.UUID, allowNull: false },
  name:            { type: DataTypes.STRING, allowNull: false },
  quantity:        { type: DataTypes.FLOAT, allowNull: false },
  unitPrice:       { type: DataTypes.FLOAT, allowNull: false },
  total:           { type: DataTypes.FLOAT },
}, {
  sequelize,
  modelName: 'PurchaseOrderItem',
  tableName: 'purchase_order_items',
  timestamps: false,
})

export default PurchaseOrderItem
