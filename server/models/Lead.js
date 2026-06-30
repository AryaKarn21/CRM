import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/db.js'

class Lead extends Model {}

Lead.init({
  id:            { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  companyId:     { type: DataTypes.UUID, allowNull: true },
  name:          { type: DataTypes.STRING, allowNull: false },
  email:         { type: DataTypes.STRING },
  phone:         { type: DataTypes.STRING },
  company_name:  { type: DataTypes.STRING },
  stage: {
    type: DataTypes.ENUM('New','Contacted','Qualified','Proposal','Negotiation','Closed Won','Closed Lost'),
    defaultValue: 'New',
  },
  source: {
    type: DataTypes.ENUM('', 'Website','Referral','Social Media','Email','Cold Call','Advertisement','Other'),
  },
  value:         { type: DataTypes.FLOAT, defaultValue: 0 },
  assignedToId:  { type: DataTypes.UUID, allowNull: true },
  tags:          { type: DataTypes.JSON, defaultValue: [] },
  convertedAt:   { type: DataTypes.DATE },
  // was a nested object { account, contact, opportunity } -> flattened columns
  convertedAccountId:     { type: DataTypes.UUID, allowNull: true },
  convertedContactId:     { type: DataTypes.UUID, allowNull: true },
  convertedOpportunityId: { type: DataTypes.UUID, allowNull: true },
}, {
  sequelize,
  modelName: 'Lead',
  tableName: 'leads',
  timestamps: true,
  indexes: [
    { fields: ['companyId', 'stage'] },
    { fields: ['companyId', 'createdAt'] },
  ],
})

export default Lead
