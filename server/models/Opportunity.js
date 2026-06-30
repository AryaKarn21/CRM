import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/db.js'

class Opportunity extends Model {}

Opportunity.init({
  id:           { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  companyId:    { type: DataTypes.UUID, allowNull: true },
  name:         { type: DataTypes.STRING, allowNull: false },
  accountId:    { type: DataTypes.UUID, allowNull: true },
  stage: {
    type: DataTypes.ENUM(
      'Prospecting','Qualification','Needs Analysis','Value Proposition',
      'Decision Makers','Perception Analysis','Proposal/Price',
      'Negotiation/Review','Closed Won','Closed Lost'
    ),
    defaultValue: 'Prospecting',
  },
  value:        { type: DataTypes.FLOAT, defaultValue: 0 },
  probability:  { type: DataTypes.INTEGER, defaultValue: 10, validate: { min: 0, max: 100 } },
  closeDate:    { type: DataTypes.DATE },
  description:  { type: DataTypes.TEXT },
  assignedToId: { type: DataTypes.UUID, allowNull: true },
  source:       { type: DataTypes.STRING },
}, {
  sequelize,
  modelName: 'Opportunity',
  tableName: 'opportunities',
  timestamps: true,
  indexes: [{ fields: ['companyId', 'stage'] }],
})

export default Opportunity
