const {Schema, model} = require('mongoose')

const unitScheme = Schema( {
  course: {
    type: Schema.Types.ObjectId,
	ref: "courses",
    required: true
  },
  unitName: {
	type: String,
	required: true
  },
  level: {
    type: String,
    required: true
  },
  unitItems: [
    {
      type: Schema.Types.ObjectId,
      ref: 'unitItems'
    }
  ],
	quizzes:
	[
		{
			type: Schema.Types.ObjectId,
			ref: "quiz"
		}
	]
} )

module.exports = model('units', unitScheme)