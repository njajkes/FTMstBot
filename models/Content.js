const {Schema, model} = require('mongoose')


const contentScheme = Schema( {
  courseName: {
    type: String,
    require: true
  },
  typeOfContent: {
    type: String,
    require: true
  },
  timeout: {
    type: Number,
    $min:
  }
} )