const {Schema, model} = require('mongoose')

const quizSchema = new Schema(
{
	content:
	{
		type: String,
		required: true
	},
	answer:
	{
		type: String,
		required: true
	},
	itemOwner:
	{
		type: Schema.Types.ObjectId,
		ref: 'units',
		required: true
	},
	level: 
	{
		type: String,
		required: true
	},
	special:
	{
		type: Boolean,
		default: false
	},
	weight:
	{
		type: Number,
		default: 1
	}
});

module.exports = model('coursequiz', quizSchema);