export const errorHandler = (err, req, res, next) => {
  console.error(err.stack)

  // Sequelize equivalent of Mongoose ValidationError
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map(e => e.message)
    return res.status(400).json({ message: 'Validation error', errors })
  }

  // Sequelize equivalent of Mongo's duplicate key error (code 11000)
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors?.[0]?.path || Object.keys(err.fields || {})[0] || 'field'
    return res.status(400).json({ message: `${field} already exists` })
  }

  // Sequelize equivalent of Mongoose CastError (bad ID format / type mismatch)
  if (err.name === 'SequelizeDatabaseError') {
    return res.status(400).json({ message: 'Invalid ID format' })
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({ message: 'Referenced record does not exist' })
  }

  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  })
}
