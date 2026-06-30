import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/db.js'

// Replaces Project.members embedded array [{ user, role }].
class ProjectMember extends Model {}

ProjectMember.init({
  id:        { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  projectId: { type: DataTypes.UUID, allowNull: false },
  userId:    { type: DataTypes.UUID, allowNull: false },
  role:      { type: DataTypes.STRING },
}, {
  sequelize,
  modelName: 'ProjectMember',
  tableName: 'project_members',
  timestamps: false,
})

export default ProjectMember
