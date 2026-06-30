// Every Mongoose document the client previously consumed exposed `_id`.
// Sequelize's primary key column is `id`. Rather than rewriting 22 spots
// across the React app, every model's JSON output here is shaped to also
// include `_id` (mirroring `id`), so existing frontend code keeps working
// untouched.
//
// Usage: call `applyMongoCompatJSON(SomeModel)` once after `Model.init(...)`
// in any model file, OR — simpler — import and spread this toJSON into the
// model options. We use the simplest approach: a shared override applied
// in models/index.js to every model after they're all defined.

export function withMongoCompatJSON(ModelClass) {
  const originalToJSON = ModelClass.prototype.toJSON
  ModelClass.prototype.toJSON = function () {
    const values = originalToJSON ? originalToJSON.call(this) : { ...this.get() }
    if (values.id !== undefined && values._id === undefined) {
      values._id = values.id
    }
    return values
  }
  return ModelClass
}
