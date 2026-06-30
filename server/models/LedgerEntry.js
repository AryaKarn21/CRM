import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/db.js'

class LedgerEntry extends Model {}

LedgerEntry.init({
  id:          { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  companyId:   { type: DataTypes.UUID, allowNull: false },
  date:        { type: DataTypes.DATEONLY, allowNull: false },
  reference:   { type: DataTypes.STRING },
  description: { type: DataTypes.TEXT, allowNull: false },
  // was embedded object { name, code } -> flattened
  accountName: { type: DataTypes.STRING },
  accountCode: { type: DataTypes.STRING },
  type:        { type: DataTypes.ENUM('debit','credit'), allowNull: false },
  debit:       { type: DataTypes.FLOAT, defaultValue: 0 },
  credit:      { type: DataTypes.FLOAT, defaultValue: 0 },
  balance:     { type: DataTypes.FLOAT, defaultValue: 0 },
  category:    { type: DataTypes.STRING },
  createdById: { type: DataTypes.UUID, allowNull: true },
}, {
  sequelize,
  modelName: 'LedgerEntry',
  tableName: 'ledger_entries',
  timestamps: true,
  indexes: [{ fields: ['companyId', 'date'] }],
})

export default LedgerEntry
