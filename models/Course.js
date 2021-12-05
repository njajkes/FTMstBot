const {Schema, model} = require('mongoose')

const courseScheme = Schema({
	owner:
	{
		type: Schema.Types.ObjectId,
		ref: 'partners',
		required: true
	},
	courseName:
	{
		type: String,
		required: true,
		unique: true
	},
	courseDesc:
	{
		type: String,
		required: true
	},
	units:
	[
		{
			type: Schema.Types.ObjectId,
			ref: 'units'
		}
	],
	introQuizzes:
	[
		{
			type: Schema.Types.ObjectId,
			ref: 'coursequiz'
		}
	],
	outroQuizzes:
	[
		{
			type: Schema.Types.ObjectId,
			ref: 'coursequiz'
		}
	],
	subscribersList:
	[
		{
			type: Schema.Types.ObjectId,
			ref: 'users'
		}
	],
	visibility: Boolean
});

module.exports = model('courses', courseScheme);