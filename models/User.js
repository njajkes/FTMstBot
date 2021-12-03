const {Schema, model} = require('mongoose')

const userSceme = Schema({
  uid: Number,
  role: String
})

module.exports = model('users', userSceme)