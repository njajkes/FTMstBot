const User = require('../models/User')
const Partner = require('../models/Partners')
const Course = require('../models/Course')
const Unit = require("../models/Unit");
const UnitItem = require("../models/UnitItem");
const Quiz = require("../models/Quiz");
const CourseQuiz = require("../models/CourseQuiz");
const UserCourseInfo = require("../models/UserCourseInfo");
const Input = require('../models/Command')
const { findUserByUid, findUserByUsername } = require('../controller/UserController')
const { makeButtons, later } = require('../utils')

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

const menu = new Input(
	"/menu",
	msg => "/menu",
	msg => msg.text === "/menu",
	async (msg, bot, sess) => {
		let user = await findUserByUid(msg.from.id);
		if(!user)
		{
			user = new User({ uid: msg.from.id, role: "slave", username: msg.from.username });
			await user.save();
			await showAllPartners(msg, bot)
		}
		await bot.sendMessage(msg.chat.id, `Здравствуйте, ${msg.from.first_name}! Добро пожаловать на ...`); // TODO: дописать хуйню
		return true;
	})

const deleteUser = new Input(
	"/__delete__user",
	async msg => {
		const user = await findUserByUid(msg.from.id);
		return isMaster(user) ? "@DEV /__delete__user - удалить пользователя" : undefined;
	},
	msg => msg.text.split(' ')[0] == '/__delete__user',
	async (msg, bot, sess) => {
		const [, userQuery] = msg.text.split(' ')
		if (!userQuery) {
			await bot.sendMessage(msg.chat.id, `Пожалуйста, введите команду согласно следующему синтаксису:${documentationMap.get("/__delete__user")}`)
			return false
		}
		const user = await findUserByUsername(userQuery)
		if (!user) {
			await bot.sendMessage(msg.chat.id, `Пользователь ${userQuery} не найден в базе данных!`)
			return false
		}
		await user.remove()	
		await bot.sendMessage(msg.chat.id, `Удаление прошло успешно!`)
		return true
	})

const changeUserRole = new Input(
	"/__change__user__role",
	async msg => {
		const user = await findUserByUid(msg.from.id);
		return isMaster(user) ? "@DEV /__change__user__role - изменить роль пользователя" : undefined;
	},
	msg => msg.text.split(' ')[0] == '/__change__user__role',
	async (msg, bot, sess) => {
		const [ , userQuery, newRole, partnerRef] = msg.text.split(' ')

		if (!userQuery || !newRole) {
			await bot.sendMessage(msg.chat.id, `Пожалуйста, введите команду согласно следующему синтаксису: ${documentationMap.get('/__change__user__role')}`)
			return false
		}

		if (!['master', 'slave', 'admin'].includes(newRole)) {
			await bot.sendMessage(msg.chat.id, `Некорректная роль: ${newRole}.\nВведите роль из следующих: master, admin, slave`)
			return false
		}

		const user = await findUserByUsername(userQuery)
		if (!user) {
			await bot.sendMessage(msg.chat.id, `Пользователь ${userQuery} не найден в базе данных!`)
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
				await bot.sendMessage(msg.chat.id, `Компания ${partnerRef} не найдена в базе данных`)
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
		await bot.sendMessage(msg.chat.id, `Роль успешно изменена!\nРоль ${userQuery} - ${newRole}`)
		return true
	})

const addNewPartner = new Input(
	"/__add__new__partner",
	async msg => {
		const user = await findUserByUid(msg.from.id);
		return isMaster(user) ? "@DEV /__add__new__partner - добавить нового партнёра" : undefined;
	},
	msg => msg.text.split(' ')[0] == '/__add__new__partner',
	async (msg, bot, sess) => {
		[, newPartnerName] = msg.text.split(' ')
		if (!newPartnerName) {
			await bot.sendMessage(msg.chat.id, `Пожалуйста, введите команду согласно следующему синтаксису: ${documentationMap.get('/__add__new__partner')}`)
			return false
		}
		try {
			const newPartner = new Partner({
				companyName: newPartnerName
			})
			await newPartner.save()
			await bot.sendMessage(msg.chat.id, 'Партнёр успешно добавлен')
			return true
		} catch (e) {
			await bot.sendMessage(msg.chat.id, 'Партнёр уже был создан, либо произошла иная ошибка при добавлении нового партнера в систему:\n' + e.message)
			return false
		}
	})

const subsOnPartner = new Input(
	"/subs_on_partner",
	msg => "/subs_on_partner - Подписаться на курсы компании",
	msg => msg.text.split(' ')[0] == '/subs_on_partner' ,
	async (msg, bot, sess) => {
		await showAllPartners(msg, bot);
		return true
	})

/*
const unsubsOnPartner = new Input(
	"/unsubs_on_partner",
	msg => "Отписаться от курсов компании",
	msg => msg.text.split(' ')[0] == '/unsubs_on_partner',
	async (msg, bot, sess) => {
		// ты
	})
*/

const selectPartner = new Input(
	"selectPartner",
	msg => "название компании",
	msg => true,
	async (msg, bot, sess) => {
		const user = await findUserByUid(msg.from.id);
		const partner = await Partner.findOne({ companyName: msg.text });

		if(!partner)
		{
			await bot.sendMessage(msg.from.id, "Компания не найдена!");
			await showAllPartners(msg, bot)
			return false;
		}

		await showAllCourses(msg, bot, partner);
		sess.lastPartner = partner;
		return true;
	})

const selectCourse = new Input(
	"selectCourse",
	msg => "название курса",
	msg => true,
	async (msg, bot, sess) => {
		const course = await Course.findOne({ courseName: msg.text });

		if(!course)
		{
			await bot.sendMessage(msg.from.id, "Курс не найден!");
			await showAllCourses(msg, bot, sess.lastPartner);
			return false;
		}

		await bot.sendMessage(msg.from.id, "Курс: " + course.courseName + "\n\n" + course.courseDesc);
		sess.lastCourse = course;
		return true;
	});

const startCourse = new Input(
	"/startcourse",
	msg => "/startcourse",
	msg => msg.text === "/startcourse",
	async (msg, bot, sess) => {
		const user = await findUserByUid(msg.from.id);
		let ucinfo = await UserCourseInfo.findOne({ user: user._id, course: sess.lastCourse._id });

		if(!ucinfo)
		{
			ucinfo = new UserCourseInfo({ user: user._id, course: sess.lastCourse._id });
			ucinfo.save();
		}

		if(ucinfo.finishedIntro)
		{
			await showAllUnits(msg, bot, sess.lastCourse);
		}
		else
		{
			sess.doingIntro = true;
			sess.pendingQuizzes = (await getIntroQuizzes(sess.lastCourse)).slice(0); // shallow copy
			sess.introAnswered = 0;
			await showQuiz(msg, bot, sess.pendingQuizzes);
		}

		return true;
	});

const startUnit = new Input(
	"startUnit",
	msg => "номер модуля",
	msg => true,
	async (msg, bot, sess) => {
		if(isNaN(msg.text) || +msg.text < 1 || +msg.text > sess.lastCourse.units.length)
		{
			await bot.sendMessage(msg.from.id, "Модуль не найден!");
			await showAllUnits(msg, bot, sess.lastCourse);
			return false;
		}

		const uId = sess.lastCourse.units[+msg.text - 1];
		const items = await getUnitItemsByUnitId(uId);

		let maxTimeout = 0;

		for(let item of items)
		{
			if(item.timeout > maxTimeout)
			{
				maxTimeout = item.timeout;
			}
			
			setTimeout(() =>
			{
				if(item.contentType === "txt")
				{
					bot.sendMessage(msg.from.id, item.content);
				}
				else if(item.contentType === "img")
				{
					bot.sendPhoto(msg.from.id, item.content);
				}
			}, item.timeout);
		}

		await later(maxTimeout + 1000);
		
		sess.pendingQuizzes = (await getQuizzesByUnitId(uId)).slice(0); // shallow copy
		
		await showQuiz(msg, bot, sess.pendingQuizzes);

		return true;
	});

const answerQuiz = new Input(
	"answerQuiz",
	msg => "ответ на вопрос",
	msg => true,
	async (msg, bot, sess) => {
		const quiz = sess.pendingQuizzes.shift();

		const correct = msg.text === quiz.answer;
		await bot.sendMessage(msg.from.id, correct ? "Верно!" : "Неверно!");

		const user = await findUserByUid(msg.from.id);
		let ucinfo = await UserCourseInfo.findOne({ user: user._id, course: sess.lastCourse._id });

		if(sess.doingIntro)
		{
			ucinfo.introCorrect[sess.introAnswered++] = correct;
			await ucinfo.save();
		}

		if(sess.pendingQuizzes.length > 0)
		{
			await showQuiz(msg, bot, sess.pendingQuizzes);
		}
		else if(sess.doingIntro)
		{
			sess.doingIntro = false;

			ucinfo.finishedIntro = true;
			await ucinfo.save();
		}

		return true;
	});

async function showQuiz(msg, bot, pendingQuizzes)
{
	const quiz = pendingQuizzes[0];
	
	await bot.sendMessage(msg.from.id, quiz.content);
}

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

/*
async function getPartners(user)
{
	//const partnerPromises = await user.partners.map(async pId => await Partner.findOne(pId));
	//return Promise.all(partnerPromises);
}
*/

function getCourses(partner)
{
	return Course.find({ owner: partner._id });
	//const coursePromises = await partner.coursesList.map(async cId => await Course.findOne(cId));
	//return Promise.all(coursePromises);
}

function getUnits(course)
{
	return Unit.find({ course: course._id });
}

function getUnitItemsByUnitId(uId)
{
	return UnitItem.find({ itemOwner: uId });
}

function getQuizzesByUnitId(uId)
{
	return Quiz.find({ itemOwner: uId });
}

function getIntroQuizzes(course)
{
	const promises = course.introQuizzes.map(qId => CourseQuiz.findById(qId));
	return Promise.all(promises);
}

async function showAllPartners(msg, bot)
{
	const user = await findUserByUid(msg.from.id)
	const partners = await Partner.find();

	await bot.sendMessage(msg.from.id, partners.map(p => ":    " + p.companyName).join("\n"), await makeButtons(partners.map(p => p.companyName)));
}

async function showAllCourses(msg, bot, partner)
{
	const courses = await getCourses(partner);

	await bot.sendMessage(msg.chat.id, courses.map(c => ":    " + c.courseName).join("\n"), await makeButtons(courses.map(c => c.courseName)));

}

async function showAllUnits(msg, bot, course)
{
	const units = await getUnits(course);
	
	await bot.sendMessage(msg.chat.id, units.map(u => ":    " + u.unitName).join("\n"), await makeButtons(units.map(u => u.unitName)));
}

module.exports = {
	menu,
	selectPartner,
	selectCourse,
	deleteUser,
	changeUserRole,
	addNewPartner,
	subsOnPartner,
	startCourse,
	startUnit,
	answerQuiz
}