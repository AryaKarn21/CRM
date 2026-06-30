import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/db.js'

// Replaces Ticket.replies embedded array.
class TicketReply extends Model {}

TicketReply.init({
  id:         { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  ticketId:   { type: DataTypes.UUID, allowNull: false }, // FK to tickets.id (not the human-facing ticketId number)
  message:    { type: DataTypes.TEXT, allowNull: false },
  authorId:   { type: DataTypes.UUID, allowNull: true },
  isInternal: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  sequelize,
  modelName: 'TicketReply',
  tableName: 'ticket_replies',
  timestamps: true,
})

export default TicketReply
