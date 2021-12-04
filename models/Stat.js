const {Schema, model} = require('mongoose')

const statisticScheme = new Schema({
  ownerUid: Number,
  ownerUsername: String,
  courseName: String,
  unitName: String,
  
})

module.exports = model('statistics', statisticScheme)