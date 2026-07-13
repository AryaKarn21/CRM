import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";

class Notification extends Model {}

Notification.init(
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

    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    senderId: {
      type: DataTypes.UUID,
      allowNull: true,
    },

    module: {
      type: DataTypes.ENUM(
        "calendar",
        "crm",
        "hr",
        "finance",
        "inventory",
        "procurement",
        "projects",
        "support",
        "settings"
      ),
      allowNull: false,
    },

    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    priority: {
      type: DataTypes.ENUM(
        "low",
        "medium",
        "high",
        "urgent"
      ),
      defaultValue: "medium",
    },

    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },

    // ✅ Added because notification.service.js already uses it
    
    actionUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Notification",
    tableName: "notifications",
    timestamps: true,

    indexes: [
      {
        fields: ["userId", "isRead"],
      },
      {
        fields: ["companyId", "userId"],
      },
      {
        fields: ["createdAt"],
      },
    ],
  }
);

export default Notification;