import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/db.js'

class Vendor extends Model {}

Vendor.init({
  id:             { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  companyId:      { type: DataTypes.UUID, allowNull: false },
  name:           { type: DataTypes.STRING, allowNull: false },
  email:          { type: DataTypes.STRING },
  phone:          { type: DataTypes.STRING },
  address:        { type: DataTypes.STRING },
  contactPerson:  { type: DataTypes.STRING },
  paymentTerms:   { type: DataTypes.STRING },
  rating:         { type: DataTypes.FLOAT, defaultValue: 0, validate: { min: 0, max: 5 } },
  isActive:       { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  sequelize,
  modelName: 'Vendor',
  tableName: 'vendors',
  timestamps: true,
})

export default Vendor
