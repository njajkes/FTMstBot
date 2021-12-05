const Partner = require('./models/Partners')
const Course = require('./models/Course')

const makeButtons = names =>
{
	return {
		reply_markup: { keyboard: names.map(n => [ n ]), resize_keyboard: true}
	};
}

const later = (delay) =>
{
	return new Promise(function(resolve)
	{
		setTimeout(resolve, delay);
	});
}

module.exports = {
	makeButtons,
	later
}