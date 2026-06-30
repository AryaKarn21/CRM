import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/db.js'

class Task extends Model {}

Task.init({
  id:           { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  companyId:    { type: DataTypes.UUID, allowNull: false },
  projectId:    { type: DataTypes.UUID, allowNull: false },
  title:        { type: DataTypes.STRING, allowNull: false },
  description:  { type: DataTypes.TEXT },
  status: {
    type: DataTypes.ENUM('todo','in_progress','review','done'),
    defaultValue: 'todo',
  },
  priority: {
    type: DataTypes.ENUM('Low','Medium','High','Urgent'),
    defaultValue: 'Medium',
  },
  assignedToId: { type: DataTypes.UUID, allowNull: true },
  dueDate:      { type: DataTypes.DATEONLY },
  completed:    { type: DataTypes.BOOLEAN, defaultValue: false },
  completedAt:  { type: DataTypes.DATE },
}, {
  sequelize,
  modelName: 'Task',
  tableName: 'tasks',
  timestamps: true,
})

export default Task
