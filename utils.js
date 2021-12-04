const Partner = require('./models/Partners')
const Course = require('./models/Course')

const partnerButtons = async (msg, partners) =>
{
	const partnerCmds = partners.map(p => [ p.companyName ]);
	
	return {
		// reply_to_message_id: msg.message_id,
		reply_markup: { keyboard: partnerCmds }
	};
}

const courseButtons = async (msg, courses) =>
{
	const courseCmds = courses.map(c => [ c.courseName ]);

	return {
		// reply_to_message_id: msg.message_id,
		reply_markup: { keyboard: courseCmds }
	};
}

module.exports = {
  partnerButtons,
  courseButtons
}