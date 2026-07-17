import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/db.js'

class PerformanceReview extends Model {}

PerformanceReview.init({
  id:           { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  companyId:    { type: DataTypes.UUID, allowNull: false },
  employeeId:   { type: DataTypes.UUID, allowNull: false },
  reviewerId:   { type: DataTypes.UUID, allowNull: false },

  reviewDate:   { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  reviewPeriod: { type: DataTypes.STRING, allowNull: false }, // e.g. "Q1 2026", "H1 2026"
  nextReviewDate: { type: DataTypes.DATE, allowNull: true },

  // ================= Ratings (1-5) =================
  technicalSkills:    { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
  communication:      { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
  leadership:         { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
  teamwork:           { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
  productivity:        { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
  problemSolving:      { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
  attendanceRating:   { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
  behaviour:           { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
  learningAbility:     { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
  goalAchievement:     { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },

  // overallRating is computed (average of the above) but stored for fast querying/sorting
  overallRating:       { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },

  // ================= Narrative =================
  strengths:           { type: DataTypes.TEXT, allowNull: true },
  weaknesses:          { type: DataTypes.TEXT, allowNull: true },
  managerFeedback:     { type: DataTypes.TEXT, allowNull: true },
  employeeFeedback:    { type: DataTypes.TEXT, allowNull: true },

  // ================= Outcomes =================
  promotionEligible:   { type: DataTypes.BOOLEAN, defaultValue: false },
  salaryIncrementRecommendation: { type: DataTypes.FLOAT, allowNull: true }, // % recommended

  status: {
    type: DataTypes.ENUM('draft', 'submitted', 'acknowledged'),
    defaultValue: 'submitted',
  },
}, {
  sequelize,
  modelName: 'PerformanceReview',
  tableName: 'performance_reviews',
  timestamps: true,
  indexes: [
    { fields: ['companyId', 'employeeId'] },
    { fields: ['employeeId', 'reviewDate'] },
  ],
  hooks: {
    beforeSave: (review) => {
      const ratingFields = [
        'technicalSkills', 'communication', 'leadership', 'teamwork',
        'productivity', 'problemSolving', 'attendanceRating', 'behaviour',
        'learningAbility', 'goalAchievement',
      ]
      const sum = ratingFields.reduce((acc, key) => acc + (Number(review[key]) || 0), 0)
      review.overallRating = Math.round((sum / ratingFields.length) * 100) / 100
    },
  },
})

export default PerformanceReview