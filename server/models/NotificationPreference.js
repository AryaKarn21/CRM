import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";

class NotificationPreference extends Model {}

NotificationPreference.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
    },

    emailEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    browserEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    soundEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    meetingNotifications: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    crmNotifications: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    hrNotifications: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    financeNotifications: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    inventoryNotifications: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    procurementNotifications: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    projectNotifications: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    supportNotifications: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: "NotificationPreference",
    tableName: "notification_preferences",
    timestamps: true,
  }
);

export default NotificationPreference;