const Bot = require('../index')
const User = require('../models/User')
const Partner = require('../models/Partners')
const Course = require('../models/Course')
const Input = require('../models/Command')
const { findUserByUid } = require('../controller/UserController')
const { partnerButtons, courseButtons } = require('../utils')

const start = new Input(
	"/start",
	"/start",
	msg => msg.text === "/start",
	async (msg, bot) => {
		let user = await findUserByUid(msg.from.id);

		if(!user)
		{
			user = new User({ uid: msg.from.id, role: "slave" });
			user.save();
		}

		bot.sendMessage(msg.chat.id, `Здравствуйте, ${user.role} @${msg.from.username}`);

		const partners = isAdmin(user) ? await getPartners : await Partner.find();
		const buttons = await partnerButtons(msg, partners);

		bot.sendMessage(msg.from.id, "Выберите компанию:\n" + partners.map(p => "      " + p.companyName).join("\n"), buttons);

		return true;
	}
)

const selectPartner = new Input(
	"selectPartner",
	"название компании",
	msg => true,
	async (msg, bot) => {
		const user = await findUserByUid(msg.from.id);
		const partner = await Partner.findOne({ companyName: msg.text });

		if(!partner)
		{
			bot.sendMessage(msg.from.id, "Компания не найдена!");
			return false;
		}

		const courses = await getCourses(partner);

		bot.sendMessage(msg.chat.id, "Выберите курс:\n" + courses.map(c => "      " + c.courseName).join("\n"), await courseButtons(msg, courses));

		return true;
  }
)

const selectCourse = new Input(
	"selectCourse",
	"название курса",
	async msg =>
	{
		const user = await findUserByUid(msg.from.id);
		return isSlave(user);
	},
	async (msg, bot) => {
		const course = await Course.findOne({ courseName: msg.text });

		if(!course)
		{
			bot.sendMessage(msg.from.id, "Курс не найден!");
			return false;
		}

		bot.sendMessage(msg.from.id, "курс: " + msg.text);
		return true;
	});

function isSlave(user)
{
	return user.role === "slave";
}

function isAdmin(user)
{
	return user.role === "admin";
}

function isMaster(user)
{
	return user.role === "master";
}

function getUser(msg)
{
	return User.findOne({ uid: msg.from.id });
}

function getPartners(user)
{
	const partnerPromises = user.partners.map(async pId => Partner.findOne(pId));
	return Promise.all(partnerPromises);
}

function getCourses(partner)
{
	const coursePromises = partner.coursesList.map(async cId => Course.findOne(cId));
	return Promise.all(coursePromises);
}


module.exports = {
  start,
  selectPartner,
  selectCourse,
}