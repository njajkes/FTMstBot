const {Schema, model} = require('mongoose')

const unitItemScheme = new Schema({
  contentType: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  answer: {
	  type: String
  },
  timeout: {
	type: Number
  },
  itemOwner: {
    type: Schema.Types.ObjectId,
    ref: 'units',
    required: true
  }
})

module.exports = model('unitItems', unitItemScheme)