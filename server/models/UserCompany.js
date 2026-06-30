import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/db.js'

// Replaces Mongoose's User.companies: [ObjectId] array.
class UserCompany extends Model {}

UserCompany.init({
  userId:    { type: DataTypes.UUID, allowNull: false },
  companyId: { type: DataTypes.UUID, allowNull: false },
}, {
  sequelize,
  modelName: 'UserCompany',
  tableName: 'user_companies',
  timestamps: false,
})

export default UserCompany
