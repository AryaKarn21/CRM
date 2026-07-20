import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/db.js'

class Role extends Model {}

Role.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    companyId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
    },

    permissions: {
      type: DataTypes.JSON,
      defaultValue: {},
    },

    // ── Added for Role lifecycle management ──
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Role',
    tableName: 'roles',
    timestamps: true,
    indexes: [{ fields: ['companyId', 'isDeleted'] }],
  }
)

export default Role