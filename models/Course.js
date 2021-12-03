const {Schema, model} = require('mongoose')

const courseScheme = Schema({
  ownerName: {
    type: Schema.Types.ObjectId,
    ref: 'partners',
    required: true
  },
  courseName: {
    type: String,
    required: true
  },
  content: [
    {
      type: Schema.Types.ObjectId,
      ref: 'contents'
    }
  ],
  subscribersList: [
    {
      type: Schema.Types.ObjectId,
      ref: 'users'
    }
  ],


})

module.exports = model('courses', courseScheme)