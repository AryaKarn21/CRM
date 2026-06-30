import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/db.js'

class AuditLog extends Model {}

AuditLog.init({
  id:         { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  companyId:  { type: DataTypes.UUID, allowNull: true },
  userId:     { type: DataTypes.UUID, allowNull: true },
  action:     { type: DataTypes.STRING, allowNull: false },
  resource:   { type: DataTypes.STRING, allowNull: false },
  resourceId: { type: DataTypes.STRING },
  changes:    { type: DataTypes.JSON }, // was Mongoose Schema.Types.Mixed
  ipAddress:  { type: DataTypes.STRING },
}, {
  sequelize,
  modelName: 'AuditLog',
  tableName: 'audit_logs',
  timestamps: true,
  indexes: [{ fields: ['companyId', 'createdAt'] }],
})

export default AuditLog
