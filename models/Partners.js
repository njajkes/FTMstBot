const {Schema, model} = require('mongoose')

const partnerScheme = new Schema({
  companyName: {
    type: String,
    required: true,
    unique: true
  },
  coursesList: [
    {
      type: Schema.Types.ObjectId,
      ref: 'courses'
    }
  ],
  slavesList: [
    {
      type: Schema.Types.ObjectId,
      ref: 'users'
    }
  ],
  adminsList: [
    {
      type: Schema.Types.ObjectId,
      ref: 'users'
    }
  ],
  validationKey: String
})

module.exports = model('partners', partnerScheme)