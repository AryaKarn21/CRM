import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/db.js'

class Ticket extends Model {}

Ticket.init({
  id:           { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  companyId:    { type: DataTypes.UUID, allowNull: true },
  // was a manually incremented Number in a pre('save') hook -> use MySQL
  // AUTO_INCREMENT on a secondary column instead (see note in Ticket routes).
  ticketId:     { type: DataTypes.INTEGER, unique: true, autoIncrement: true },
  subject:      { type: DataTypes.STRING, allowNull: false },
  description:  { type: DataTypes.TEXT, allowNull: false },
  priority: {
    type: DataTypes.ENUM('Low','Medium','High','Urgent'),
    defaultValue: 'Medium',
  },
  status: {
    type: DataTypes.ENUM('Open','In Progress','Pending','Resolved','Closed'),
    defaultValue: 'Open',
  },
  category:     { type: DataTypes.STRING },
  assignedToId: { type: DataTypes.UUID, allowNull: true },
  createdById:  { type: DataTypes.UUID, allowNull: true },
  resolvedAt:   { type: DataTypes.DATE },
  closedAt:     { type: DataTypes.DATE },
  slaDeadline:  { type: DataTypes.DATE },
}, {
  sequelize,
  modelName: 'Ticket',
  tableName: 'tickets',
  timestamps: true,
})

export default Ticket
