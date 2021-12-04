const User = require('../models/User')
const Partner = require('../models/Partners')
const Course = require('../models/Course')
const Input = require('../models/Command')
const { findUserByUid, findUserByUsername } = require('../controller/UserController')
const { partnerButtons, courseButtons } = require('../utils')

/*
	Пример документации для команды:
	\n
	\n
	/__change__user__role [никнейм] [роль] [-компания], где\n
	\n
	[никнейм] - никнейм пользователя без собачки (@)\n
	[роль] - новая роль: master, admin, slave\n
	[-компания] - необязательный атрибут, указывающийся при роль=admin; указывает пользователя в качестве админа компании-партнера
*/

const documentationMap = new Map()
{
	documentationMap.set('/__delete__user', `\n\n/__delete__user [никнейм], где\n\n[никнейм] - никнейм пользователя без собачки (@), которого вы хотите удалить\n`)
	documentationMap.set('/__change__user__role', `\n\n/__change__user__role [никнейм] [роль] [-компания], где\n\n[никнейм] - никнейм пользователя без собачки (@)\n[роль] - новая роль: master, admin, slave\n[-компания] - необязательный атрибут, указывающийся при роль=admin; указывает пользователя в качестве админа компании-партнера`)
	documentationMap.set('/__add__new__partner', `\n\n/__add__new__partner [название_компании], где\n\n[название_компании] - название компании, которую мы хотим добавить\n`)
	documentationMap.set('/__delete__user', `\n\n/__delete__user [никнейм], где\n\n[никнейм] - никнейм пользователя без собачки (@), которого вы хотите удалить\n`)
	documentationMap.set('/__delete__user', `\n\n/__delete__user [никнейм], где\n\n[никнейм] - никнейм пользователя без собачки (@), которого вы хотите удалить\n`)
	documentationMap.set('/__delete__user', `\n\n/__delete__user [никнейм], где\n\n[никнейм] - никнейм пользователя без собачки (@), которого вы хотите удалить\n`)
	documentationMap.set('/__delete__user', `\n\n/__delete__user [никнейм], где\n\n[никнейм] - никнейм пользователя без собачки (@), которого вы хотите удалить\n`)
}

const start = new Input(
	"/start",
	"/start",
	msg => msg.text === "/start",
	async (msg, bot) => {
		let user = await findUserByUid(msg.from.id);
		if(!user)
		{
			user = new User({ uid: msg.from.id, role: "slave", username: msg.from.username });
			await user.save();
			bot.sendMessage(msg.chat.id, `Здравствуйте, @${msg.from.firstname}! Добро пожаловать на ...`); // TODO: дописать хуйню
			await showAllPartners(msg, bot)
			return true
		}
		bot.sendMessage(msg.chat.id, `Здравствуйте, @${msg.from.firstname}! Добро пожаловать на ...`); // TODO: дописать хуйню
		return true;
	}
)

const deleteUser = new Input(
	"/__delete__user",
	"@DEV /__delete__user - удалить пользователя",
	async msg => {
		const candidate = await findUserByUid(msg.from.id)
		return (msg.text.split(' ')[0] == '/__delete__user') && candidate.role == 'master'
	},
	async (msg, bot) => {
		const [, userQuery] = msg.text.split(' ')
		if (!userQuery) {
			bot.sendMessage(msg.chat.id, `Пожалуйста, введите команду согласно следующему синтаксису:${documentationMap.get("/__delete__user")}`)
			return false
		}
		const user = await findUserByUsername(userQuery)
		if (!user) {
			bot.sendMessage(msg.chat.id, `Пользователь ${userQuery} не найден в базе данных!`)
			return false
		}
		await user.remove()	
		bot.sendMessage(msg.chat.id, `Удаление прошло успешно!`)
		return true
	}
)

const changeUserRole = new Input(
	"/__change__user__role",
	"@DEV /__change__user__role - изменить роль пользователя",
	async msg => {
		const candidate = await findUserByUid(msg.from.id)
		return (msg.text.split(' ')[0] == '/__change__user__role') && candidate.role == 'master'
	},
	async (msg, bot) => {
		const [ , userQuery, newRole, partnerRef] = msg.text.split(' ')

		if (!userQuery || !newRole) {
			bot.sendMessage(msg.chat.id, `Пожалуйста, введите команду согласно следующему синтаксису: ${documentationMap.get('/__change__user__role')}`)
			return false
		}

		if (!['master', 'slave', 'admin'].includes(newRole)) {
			bot.sendMessage(msg.chat.id, `Некорректная роль: ${newRole}.\nВведите роль из следующих: master, admin, slave`)
			return false
		}

		const user = await findUserByUsername(userQuery)
		if (!user) {
			bot.sendMessage(msg.chat.id, `Пользователь ${userQuery} не найден в базе данных!`)
			return false
		}
		
		if (user.role == 'admin' && user.adminingPartners) {
			user.adminingPartners = null
		}
		if (user.role == 'admin' && newRole != 'admin') {
			user.adminingPartners = null
		}
		if (newRole == 'admin' && partnerRef) {
			const partner = await Partner.findOne({companyName: partnerRef})
			if (!partner) {
				bot.sendMessage(msg.chat.id, `Компания ${partnerRef} не найдена в базе данных`)
			} else {
				user.adminingPartners = partner
				if (!user.partners.includes(partner._id)) {
					console.log(true)
					user.partners.push(partner)
				}
			}
		}
		user.role = newRole
		user.save()
		bot.sendMessage(msg.chat.id, `Роль успешно изменена!\nРоль ${userQuery} - ${newRole}`)
		return true
	}
)

const addNewPartner = new Input(
	"/__add__new__partner",
	"@DEV /__add__new__partner - добавить нового партнёра",
	async msg => {
		const candidate = await findUserByUid(msg.from.id)
		return (msg.text.split(' ')[0] == '/__add__new__partner') && candidate.role == 'master'
	}, 
	async (msg, bot) => {
		[, newPartnerName] = msg.text.split(' ')
		if (!newPartnerName) {
			bot.sendMessage(msg.chat.id, `Пожалуйста, введите команду согласно следующему синтаксису: ${documentationMap.get('/__add__new__partner')}`)
			return false
		}
		try {
			const newPartner = new Partner({
				companyName: newPartnerName
			})
			await newPartner.save()
			bot.sendMessage(msg.chat.id, 'Партнёр успешно добавлен')
			return true
		} catch (e) {
			bot.sendMessage(msg.chat.id, 'Партнёр уже был создан, либо произошла иная ошибка при добавлении нового партнера в систему:\n' + e.message)
			return false
		}
	}
)

const subsOnPartner = new Input(
	"/subs_on_partner",
	"/subs_on_partner - Подписаться на курсы компании",
	async msg => msg.text.split(' ')[0] == '/subs_on_partner' ,
	async (msg, bot) => {
		showAllPartners(msg, bot);
		return true
	}
)

const unsubsOnPartner = new Input(
	"/unsubs_on_partner",
	"Отписаться от курсов компании",
	async msg => msg.text.split(' ')[0] == '/unsubs_on_partner',
	async (msg, bot) => {
		// ты
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
      showAllPartners(msg, bot)
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
  if (!user) return false
	return user.role === "slave";
}

function isAdmin(user)
{
  if (!user) return false
	return user.role === "admin";
}

function isMaster(user)
{
  if (!user) return false
	return user.role === "master";
}

function getUser(msg)
{
	return User.findOne({ uid: msg.from.id });
}

async function getPartners(user)
{
	const partnerPromises = await user.partners.map(async pId => await Partner.findOne(pId));
	return Promise.all(partnerPromises);
}

async function getCourses(partner)
{
	const coursePromises = await partner.coursesList.map(async cId => await Course.findOne(cId));
	return Promise.all(coursePromises);
}


async function showAllPartners(msg, bot) {
  const user = await findUserByUid(msg.from.id)
  const partners = await Partner.find(); // ?!?!?!?!!?!?
  const buttons = await partnerButtons(msg, partners);

  bot.sendMessage(msg.from.id, "Выберите компанию:\n" + partners.map(p => "      " + p.companyName).join("\n"), buttons);
}

module.exports = {
  start,
  selectPartner,
  selectCourse,
	deleteUser,
	changeUserRole,
	addNewPartner,
	subsOnPartner
}