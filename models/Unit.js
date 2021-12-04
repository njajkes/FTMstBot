const {Schema, model} = require('mongoose')

const unitScheme = Schema( {
  courseName: {
    type: String,
    require: true
  },
  forWhom: {
    type: String,
    require: true
  },
  unitItems: [
    {
      type: Schema.Types.ObjectId,
      ref: 'unitItems'
    }
  ]
} )

module.exports = model('units', unitScheme)