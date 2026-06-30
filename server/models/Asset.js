import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/db.js'

class Asset extends Model {}

Asset.init({
  id:             { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  companyId:      { type: DataTypes.UUID, allowNull: false },
  name:           { type: DataTypes.STRING, allowNull: false },
  assetId:        { type: DataTypes.STRING },
  category:       { type: DataTypes.STRING },
  purchaseDate:   { type: DataTypes.DATEONLY },
  purchasePrice:  { type: DataTypes.FLOAT },
  currentValue:   { type: DataTypes.FLOAT },
  depreciation:   { type: DataTypes.FLOAT, defaultValue: 0 },
  status: {
    type: DataTypes.ENUM('active','disposed','in_repair'),
    defaultValue: 'active',
  },
  assignedToId:   { type: DataTypes.UUID, allowNull: true }, // references Employee
  location:       { type: DataTypes.STRING },
}, {
  sequelize,
  modelName: 'Asset',
  tableName: 'assets',
  timestamps: true,
})

export default Asset
