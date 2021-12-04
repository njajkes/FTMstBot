const {Schema, model} = require('mongoose')

const unitItemScheme = new Schema({
  content: {
    type: String,
    required: true
  },
  answer: {
	  type: String,
	  required: true
  },
  itemOwner: {
    type: Schema.Types.ObjectId,
    ref: 'units',
    required: true
  }
})

module.exports = model('quiz', unitItemScheme)