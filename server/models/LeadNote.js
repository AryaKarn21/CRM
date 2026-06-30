import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/db.js'

// Replaces Lead.notes embedded array in Mongoose -> own table with FK to leads.
class LeadNote extends Model {}

LeadNote.init({
  id:          { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  leadId:      { type: DataTypes.UUID, allowNull: false },
  text:        { type: DataTypes.TEXT, allowNull: false },
  createdById: { type: DataTypes.UUID, allowNull: true },
}, {
  sequelize,
  modelName: 'LeadNote',
  tableName: 'lead_notes',
  timestamps: true,
})

export default LeadNote
