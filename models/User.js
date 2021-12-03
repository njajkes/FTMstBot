const {Schema, model, SchemaTypes} = require('mongoose')

const userSceme = Schema({
  uid: Number,
  role: String,
  username: String,
  partners: [
    {
      type: Schema.Types.ObjectId,
      ref: 'partners'
    }
  ],
  adminingPartners: [
    {
      type: Schema.Types.ObjectId,
      ref: 'partners'
    }
  ],
  courseList: [
    {
      type: Schema.Types.ObjectId,
      ref: 'courses'
    }
  ],
  
})

module.exports = model('users', userSceme)