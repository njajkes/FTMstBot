const {Schema, model} = require('mongoose')
const Partners = require('./Partners')

const userSceme = Schema({
  uid: Number,
  role: String,
  partners: [
    {
      type: Schema.Types.ObjectId,
      ref: 'partners'
    }
  ],
  
})

module.exports = model('users', userSceme)