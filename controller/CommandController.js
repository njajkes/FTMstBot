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
const { passwordStrength } = require("check-password-strength");

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

const specialQuizMap = new Map()
{
	specialQuizMap.set("gradePassword", gradePassword);
}

const menu = new Input(
	"/menu",
	msg => "/menu - выйти в меню",
	msg => msg.text === "/menu",
	async (msg, bot, sess) => {
		let user = await findUserByUid(msg.from.id);
		if(!user)
		{
			user = new User({ uid: msg.from.id, role: "slave", username: msg.from.username });
			await user.save();
		}
		bot.sendMessage(msg.chat.id, `Здравствуйте, ${msg.from.first_name}! Добро пожаловать на ...`,  {
			reply_markup: {
				remove_keyboard: true
			}
		}); // TODO: дописать хуйню
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

const partnerValidation = new Input(
	"validation",
	msg => "или введите ключ, который вам сообщила ваша компания",
	msg => true,
	async (msg, bot, sess) => {
		const partner = sess.lastPartner
		const user = await findUserByUid(msg.from.id)

		if (msg.text == partner.validationKey) {
			partner.slavesList.push(user._id)
			user.partners.push(partner._id)
			await partner.save()
			await user.save()
			
			await showAllCourses(msg, bot, partner)
			sess.lastPartner.validationNeeds = false
			return true
		} else {
			await bot.sendMessage(msg.chat.id, "Неправильный ключ!")
			return false
		}
	}
)

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
		
		sess.lastPartner = partner;
		if(!partner.slavesList.includes(user._id)) {
			sess.lastPartner.validationNeeds = true
			bot.sendMessage(msg.chat.id, `Введите ключ, который вам сообщила ваша компания: `, {reply_markup: {remove_keyboard: true}})
			return true
		}
		await showAllCourses(msg, bot, partner);
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

		await bot.sendMessage(msg.from.id, "Курс: " + course.courseName + "\n\n" + course.courseDesc, {
			reply_markup: {
				remove_keyboard: true
			}
		});
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
		if(ucinfo.finishedOutro)
		{
			await bot.sendMessage(msg.chat.id, `Захотели снова пройти наш курс? :)\nНо ведь мы рассказали всё самое интересное, что в нём было!`);
			await bot.sendMessage(msg.chat.id, `Напомню вашу статистику:`);
			await bot.sendMessage(msg.chat.id, `На начальном тестировании вы ответили правильно на ${ucinfo.introCorrect.filter(e => e).length} вопроса\nНа финальном тестировании вы ответили правильно на ${ucinfo.outroCorrect.filter(e => e).length} вопроса`)

			return false
		}
		if(ucinfo.finishedIntro)
		{
			await showUserUnfinishedUnits(msg, bot, sess.lastCourse);
		}
		else
		{
			sess.doingIntro = true;
			sess.pendingQuizzes = await getIntroQuizzes(sess.lastCourse)
			sess.pendingQuizzes = sess.pendingQuizzes.slice(0); // shallow copy
			sess.introAnswered = 0;
			await bot.sendMessage(msg.chat.id, "Давайте пройдём первоначальное тестирование, чтобы оценить ваши знания по этой теме! \:\)")
			await showQuiz(msg, bot, sess.pendingQuizzes);
		}

		return true;
	});

const startUnit = new Input(
	"startUnit",
	msg => "номер модуля",
	msg => true,
	async (msg, bot, sess) =>
	{
		const unitNum = msg.text.split('-')[0]

		const user = await User.findOne({uid: msg.from.id})
		const ucInfo = await UserCourseInfo.findOne({user: user._id, course: sess.lastCourse._id})
		const userUnfinishedUnits = await getUserUnfinishedUnits(sess.lastCourse, msg.from.id)
		if (userUnfinishedUnits.length == 0) {
			await bot.sendMessage(msg.from.id, "Вы уже прошли данный курс!");
			return false
		}
		if(isNaN(unitNum) || +unitNum < 1 || +unitNum > sess.lastCourse.units.length)
		{
			await bot.sendMessage(msg.from.id, "Модуль не найден!");
			await showUserUnfinishedUnits(msg, bot, sess.lastCourse);
			return false;
		}
		const uId = sess.lastCourse.units[+unitNum - 1];
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
					bot.sendMessage(msg.from.id, item.content, {reply_markup: {remove_keyboard: true}} );
				}
				else if(item.contentType === "img")
				{
					bot.sendPhoto(msg.from.id, item.content, {reply_markup: {remove_keyboard: true}} );
				}
			}, item.timeout);
		}

		await later(maxTimeout + 1000);
		
		sess.pendingQuizzes = (await getQuizzesByUnitId(uId)).slice(0); // shallow copy
		ucInfo.finishedUnits.push(uId)
		ucInfo.save()
		sess.lastCourse.finishedUnitsLength = ucInfo.finishedUnits.length
		await showQuiz(msg, bot, sess.pendingQuizzes);
	  
		return true;
	});

const answerQuiz = new Input(
	"answerQuiz",
	msg => "ответ на вопрос",
	msg => true,
	async (msg, bot, sess) => {
		const quiz = sess.pendingQuizzes.shift();

		let quizFunc = gradeQuiz;
		
		if(quiz.special)
		{
			quizFunc = specialQuizMap.get(quiz.answer);
		}
		
		const correct = await quizFunc(msg, bot, sess, quiz);
		

		const user = await findUserByUid(msg.from.id);
		let ucinfo = await UserCourseInfo.findOne({ user: user._id, course: sess.lastCourse._id });

		if (sess.doingIntro) {
			ucinfo.introCorrect[sess.introAnswered++] = correct;
			if (correct) {
				const units = await Unit.find({level: quiz.level, course: sess.lastCourse._id})
				if (!units) {
					console.log("Hmmm...")
				} else {
					for (let k of units) {
						if (!ucinfo.finishedUnits.includes(k)) {
							ucinfo.finishedUnits.push(k._id)
							break
						}
					}
				}
			}
			await ucinfo.save();
		}
		if (sess.doingOutro) {
			ucinfo.outroCorrect[sess.outroAnswered++] = correct;
			await ucinfo.save()
		}

		if (sess.pendingQuizzes.length > 0) {
			await showQuiz(msg, bot, sess.pendingQuizzes);
		} else {
			if (sess.doingIntro) {
				sess.doingIntro = false;

				ucinfo.finishedIntro = true;
				await ucinfo.save();
			}
			if (sess.doingOutro) {
				sess.doingOutro = false
				ucinfo.finishedOutro = true
				sess.lastCourse.finishedOutro = true
				await ucinfo.save()

				await bot.sendMessage(msg.chat.id, `Что же, подведем итоги\nНа начальном тестировании вы ответили правильно на ${ucinfo.introCorrect.filter(e => e).length} вопроса\nНа финальном тестировании вы ответили правильно на ${ucinfo.outroCorrect.filter(e => e).length} вопроса`, { reply_markup: { remove_keyboard: true } })

				const introScore = await getIntroScore(user, sess.lastCourse, ucinfo);
				const outroScore = await getOutroScore(user, sess.lastCourse, ucinfo);
				const diff = outroScore - introScore;
				
				console.log(diff + ", " + introScore + ", " + outroScore);

				if(diff < 0)
				{
					await bot.sendMessage(msg.chat.id, `Как же так? :(\nВы точно проходили все наши квизы?..`);
					
				}
				else if(diff > 0)
				{
					await bot.sendMessage(msg.chat.id, `Стабильность - признак мастерства, верно? :)`);
				}
				else
				{
					await bot.sendMessage(msg.chat.id, `Я считаю, что мы неплохо потрудились, изучая новое, и хорошо закрепили материал! :)`);
				}
				return true
			}
			if (sess.lastCourse.units.length != ucinfo.finishedUnits.length) {
				await showUserUnfinishedUnits(msg, bot, sess.lastCourse)
			} else {
				sess.doingOutro = true;
				sess.pendingQuizzes = (await getOutroQuizzes(sess.lastCourse)).slice(0); // shallow copy
				sess.outroAnswered = 0;
				await bot.sendMessage(msg.chat.id, "А теперь закрепим наши знания, пройдя финальное тестирование! \:\)")
				await showQuiz(msg, bot, sess.pendingQuizzes);
			}
		}

		return true;
	});

async function gradeQuiz(msg, bot, sess, quiz)
{
	const correct = msg.text.split('.')[0] === quiz.answer;
	await bot.sendMessage(msg.from.id, correct ? "Верно!" : `Неверно!\nПравильный ответ: ${quiz.answer}`);
	return correct;
}

async function gradePassword(msg, bot, sess, quiz)
{
	const strength = passwordStrength(msg.text).value;

	if(strength === "Too weak")
	{
		await bot.sendMessage(msg.from.id, "Ваш пароль слишком слабый!");
		return false;
	}
	else if(strength === "Weak")
	{
		await bot.sendMessage(msg.from.id, "Ваш пароль довольно слабый :(");
		return false;
	}
	else if(strength === "Medium")
	{
		await bot.sendMessage(msg.from.id, "Ваш пароль средний, но мог бы быть сильнее");
		return true;
	}

	await bot.sendMessage(msg.from.id, "Ваш пароль сильный! :)");
	return true;
}

const courseIncreaseAvg = new Input(
	'/course_avg_increase',
	async msg =>
	{
		const user = await findUserByUid(msg.from.id);
		return isAdmin(user) ? "/course_avg_increase" : undefined;
	},
	async msg => {
		const user = await findUserByUid(msg.from.id)
		return user.role == 'admin' && msg.text.split(' ')[0] == '/course_avg_increase'
	}, 
	async (msg, bot, sess) => {
		const user = await findUserByUid(msg.from.id)
		if (user.role != 'admin') return false
		const [, courseName] = msg.text.split(' ')
		if (!courseName) {
			bot.sendMessage(msg.chat.id, "Неверный синтаксис")
			return false
		}
		const partner = user.adminingPartners // ObjectId
		const course = await Course.findOne({owner: partner, courseName: courseName})
		if (!course) {
			bot.sendMessage(msg.chat.id, "Курс не найден")
			return false
		}
		const courseStat = await UserCourseInfo.find({course: course._id})
		let result = 0
		
		for(let e of courseStat)
		{
			const introScore = await getIntroScore(user, course, e);
			const outroScore = await getOutroScore(user, course, e);
			const diff = outroScore - introScore;
			
			result += diff;
		}

		bot.sendMessage(msg.chat.id, `Среднее изменение уровня знаний по курсу: ${result > 0 ? '+' : ''}${result / courseStat.length}%`)
		return false
	}
)

const showCourseStats = new Input(
	'/show_course_stats',
	async msg =>
	{
		const user = await findUserByUid(msg.from.id);
		return isAdmin(user) ? "/show_course_stats" : undefined;
	},
	async msg => {
		const user = await findUserByUid(msg.from.id)
		return user.role == 'admin' && msg.text.split(' ')[0] == '/show_course_stats'
	}, 
	async (msg, bot, sess) => {
		const user = await findUserByUid(msg.from.id)
		if (user.role != 'admin') return false
		const [, courseName] = msg.text.split(' ')
		if (!courseName) {
			bot.sendMessage(msg.chat.id, "Неверный синтаксис")
			return false
		}
		const partner = user.adminingPartners // ObjectId
		const course = await Course.findOne({owner: partner, courseName: courseName})
		if (!course) {
			bot.sendMessage(msg.chat.id, "Курс не найден")
			return false
		}
		const courseStat = await UserCourseInfo.find({course: course._id})
		let string = `Юзернейм | Прошёл? | Сколько правильных в вводном | Сколько правильных в финальном | Изменение\n------------------------------------------`
		for (e of courseStat) {
			const user = await User.findById(e.user);
			const course = await Course.findById(e.course);

			const introScore = await getIntroScore(user, course, e);
			const outroScore = await getOutroScore(user, course, e);

			string = [string, `${user.username} | ${e.finishedOutro} | ${introScore}% | ${outroScore}% | ${outroScore - introScore}%`].join('\n')
		}
		bot.sendMessage(msg.chat.id, string)
		return false
	}
)

const showCourseNames = new Input (
	"/show_course_names",
	msg => "/show_course_names",
	async msg => {
		const user = await findUserByUid(msg.from.id)
		return user.role == 'admin' && msg.text.split(' ')[0] == '/show_course_stats'
	},
	async (msg, bot, sess) => {
		const user = await findUserByUid(msg.from.id)
		if (user.role != 'admin') return false
		const partner = user.adminingPartners // ObjectId
		const course = await Course.findOne({owner: partner})
	}
)

async function showQuiz(msg, bot, pendingQuizzes)
{
	const quiz = pendingQuizzes[0];

	if(quiz.special)
	{
		await bot.sendMessage(msg.from.id, quiz.content);
		return;
	}

	const quizAnswers = quiz.content.split('\n').slice(1).map(e => e.split('.')[0])
	await bot.sendMessage(msg.from.id, quiz.content, {
		reply_markup: {
			keyboard: [ [...quizAnswers] ],
			resize_keyboard: true
		}
	});
}

async function getIntroScore(user, course, ucinfo)
{
	const introQuizzes = await getIntroQuizzes(course);

	let introScore = 0;
	let totalIntroScore = 0;

	introQuizzes.forEach((q, i) =>
	{
		introScore += ucinfo.introCorrect[i] ? q.weight : 0;
		totalIntroScore += q.weight;
	});

	introScore = introScore / totalIntroScore * 100;

	return introScore;
}

async function getOutroScore(user, course, ucinfo)
{
	const outroQuizzes = await getOutroQuizzes(course);

	let outroScore = 0;
	let totalOutroScore = 0;

	outroQuizzes.forEach((q, i) =>
	{
		outroScore += ucinfo.outroCorrect[i] ? q.weight : 0;
		totalOutroScore += q.weight;
	});

	outroScore = outroScore / totalOutroScore * 100;

	return outroScore;
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

async function getUnits(course)
{
	return await Unit.find({ course: course._id });
}

async function getUnitItemsByUnitId(uId)
{
	return await UnitItem.find({ itemOwner: uId });
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

function getOutroQuizzes(course) 
{
	const promises = course.outroQuizzes.map(qId => CourseQuiz.findById(qId));
	return Promise.all(promises)
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

async function getUserUnfinishedUnits(course, useruid) {
	const allUnits = await getUnits(course);
	const user = await findUserByUid(useruid)
	const ucInfo = await UserCourseInfo.findOne({course: course._id, user: user._id})
	const userUnfinishedUnits = allUnits.filter(e => ! ucInfo.finishedUnits.includes(e._id))
	return userUnfinishedUnits
}

async function showUserUnfinishedUnits(msg, bot, course)
{
	const units = await getUserUnfinishedUnits(course, msg.from.id);
	
	await bot.sendMessage(msg.chat.id, units.map(u => ":    " + u.unitName).join("\n"), makeButtons(units.map(u => u.unitName)));
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
	answerQuiz,
	partnerValidation,
	courseIncreaseAvg,
	showCourseStats
}