const Partner = require('./models/Partners')
const Course = require('./models/Course')

const makeButtons = names =>
{
	return {
		reply_markup: { keyboard: names.map(n => [ n ]) }
	};
}

module.exports = {
	makeButtons
}