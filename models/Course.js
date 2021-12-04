const {Schema, model} = require('mongoose')

const courseScheme = Schema({
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'partners',
    required: true,
    unique: true
  },
  courseName: {
    type: String,
    required: true,
    unique: true
  },
  units: [
    {
      type: Schema.Types.ObjectId,
      ref: 'units'
    }
  ],
  subscribersList: [
    {
      type: Schema.Types.ObjectId,
      ref: 'users'
    }
  ],
  visibility: Boolean
})

module.exports = model('courses', courseScheme)