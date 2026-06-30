export const validate = (schema) => async (req, res, next) => {
  try {
    await schema.parseAsync(req.body)
    next()
  } catch (err) {
    res.status(400).json({
      message: 'Validation failed',
      errors: err.errors?.map(e => ({ field: e.path.join('.'), message: e.message })),
    })
  }
}
