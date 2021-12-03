const Partner = require('./models/Partners')
const Course = require('./models/Course')

const partnerButtons = async msg =>
{
	const partners = await Partner.find();
	const partnerCmds = partners.map(p => [ p.companyName ]);
	
	return {
		reply_to_message_id: msg.message_id,
		reply_markup: { keyboard: partnerCmds }
	};
}

const courseButtons = async (msg, partner) =>
{
	const coursePromises = partner.coursesList.map(async cId =>
	{
		const course = await Course.findOne(cId);
		return course.courseName;
	});

	let courseCmds = await Promise.all(coursePromises);
	courseCmds = courseCmds.map(c => [ c ]);

	return {
		reply_to_message_id: msg.message_id,
		reply_markup: { keyboard: courseCmds }
	};
}

module.exports = {
  partnerButtons,
  courseButtons
}