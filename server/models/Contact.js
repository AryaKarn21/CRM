import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/db.js'

class Contact extends Model {}

Contact.init({
  id:           { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  companyId:    { type: DataTypes.UUID, allowNull: true },
  firstName:    { type: DataTypes.STRING, allowNull: false },
  lastName:     { type: DataTypes.STRING, allowNull: false },
  email:        { type: DataTypes.STRING },
  phone:        { type: DataTypes.STRING },
  jobTitle:     { type: DataTypes.STRING },
  department:   { type: DataTypes.STRING , allowNull: true},
  accountId:    { type: DataTypes.UUID, allowNull: true },
  assignedToId: { type: DataTypes.UUID, allowNull: true },
}, {
  sequelize,
  modelName: 'Contact',
  tableName: 'contacts',
  timestamps: true,
  indexes: [{ fields: ['companyId'] }],
})

export default Contact
