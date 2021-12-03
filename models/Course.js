const {Schema, model} = require('mongoose')
const User = require('./User')
const Partners = require('./Partners')

const courseScheme = Schema({
  ownerName: {
    type: Schema.Types.ObjectId,
    ref: 'partners',
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