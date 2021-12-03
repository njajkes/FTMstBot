const {Schema, model} = require('mongoose')
const Partners = require('./Partners')
const Courses = require('./Course')

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
  courseList: [
    {
      type: Schema.Types.ObjectId,
      ref: 'courses'
    }
  ],
  
})

module.exports = model('users', userSceme)