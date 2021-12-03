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
		bot.sendMessage(msg.chat.id, "Выберите компанию", await partnerButtons(msg));

		return true;
	}
)

const selectPartner = new Input(
	"selectPartner",
	"Название компании",
	msg => true,
	async (msg, bot) => {
		const user = await findUserByUid(msg.from.id);
		const partner = await Partner.findOne({ companyName: msg.text });

		if(!partner)
		{
			bot.sendMessage(msg.from.id, "Компания не найдена!");
			return false;
		}

		if(!user.partners.includes(partner))
		{
			user.partners.push(partner);
			user.save();
		}

		bot.sendMessage(msg.chat.id, "Выберите курс", await courseButtons(msg, partner));

		return true;
  }
)

const selectCourse = new Input(
	"selectCourse",
	"Название курса",
	msg => true,
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


module.exports = {
  start,
  selectPartner,
  selectCourse,
}