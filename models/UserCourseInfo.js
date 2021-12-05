const {Schema, model} = require('mongoose')

const infoScheme = Schema({
	user:
	{
		type: Schema.Types.ObjectId,
		ref: 'users',
		required: true
	},
	course:
	{
		type: Schema.Types.ObjectId,
		ref: 'courses',
		required: true
	},
	finishedIntro:
	{
		type: Boolean,
		default: false
	},
	finishedOutro:
	{
		type: Boolean,
		default: false
	}
	,
	introCorrect:
	[
		{
			type: Boolean,
			default: false
		}
	],
	outroCorrect:
	[
		{
			type: Boolean,
			default: false
		}
	]
	,
	finishedUnits:
	[
		{
			type: Schema.Types.ObjectId,
			ref: 'units'
		}
	]
});

module.exports = model('usercourseinfo', infoScheme);