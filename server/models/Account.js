import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/db.js'

class Account extends Model {}

Account.init({
  id:         { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  companyId:  { type: DataTypes.UUID, allowNull: false },
  name:       { type: DataTypes.STRING, allowNull: false },
  industry:   { type: DataTypes.STRING },
  website:    { type: DataTypes.STRING },
  email:      { type: DataTypes.STRING },
  phone:      { type: DataTypes.STRING },
  address:    { type: DataTypes.STRING },
  type:       { type: DataTypes.ENUM('Customer','Partner','Prospect','Competitor','Other') },
  revenue:    { type: DataTypes.FLOAT },
  employees:  { type: DataTypes.INTEGER },
  assignedToId: { type: DataTypes.UUID, allowNull: true },
  tags:       { type: DataTypes.JSON, defaultValue: [] }, // was [String]
}, {
  sequelize,
  modelName: 'Account',
  tableName: 'accounts',
  timestamps: true,
  indexes: [{ fields: ['companyId', 'name'] }],
})

export default Account
