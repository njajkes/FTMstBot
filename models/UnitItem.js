const {Schema, model} = require('mongoose')

const unitItemScheme = new Schema({
  typeOfUnitItem: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  itemOwner: {
    type: Schema.Types.ObjectId,
    ref: 'units',
    required: true
  }
})

module.exports = model('unitItems', unitItemScheme)