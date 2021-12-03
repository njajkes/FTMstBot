const TFMstBot = require('node-telegram-bot-api');
const Mongo = require('mongoose');
const DotEnv = require('dotenv');
const User = require("./models/User");
const Partner = require("./models/Partner");
const Course = require("./models/Course");

const { TOKEN, MONGOKEY } = DotEnv.config().parsed

const mstBot = new TFMstBot(TOKEN, { polling: true } )

const mongoStart = async (MONGOKEY) => {
  try {
    Mongo.connect(MONGOKEY)
  } catch (e) {
    console.log(e)
  }
}

mongoStart(MONGOKEY);

class Input
{
	constructor(id, name, condition, action)
	{
		this.id = id;
		this.name = name;
		this.condition = condition;
		this.action = action;
	}
}

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

const start = new Input(
	"/start",
	"/start",
	msg => msg.text === "/start",
	async msg => {
		let user = await getUser(msg);

		if(!user)
		{
			user = new User({ uid: msg.from.id, role: "slave" });
			user.save();
		}

		mstBot.sendMessage(msg.chat.id, `Здравствуйте, ${user.role} @${msg.from.username}`);
		mstBot.sendMessage(msg.chat.id, "Выберите компанию", await partnerButtons(msg));

		return true;
	});

const selectPartner = new Input(
	"selectPartner",
	"Название компании",
	msg => true,
	async msg => {
		const user = await getUser(msg);

		const partner = await Partner.findOne({ companyName: msg.text });

		if(!partner)
		{
			mstBot.sendMessage(msg.from.id, "Компания не найдена!");
			return false;
		}

		if(!user.partners.includes(partner))
		{
			user.partners.push(partner);
			user.save();
		}

		mstBot.sendMessage(msg.chat.id, "Выберите курс", await courseButtons(msg, partner));

		return true;
	});

const selectCourse = new Input(
	"selectCourse",
	"Название курса",
	msg => true,
	async msg => {
		const course = await Course.findOne({ courseName: msg.text });

		if(!course)
		{
			mstBot.sendMessage(msg.from.id, "Курс не найден!");
			return false;
		}

		mstBot.sendMessage(msg.from.id, "курс: " + msg.text);
		return true;
	});

const sessions = new Map();

const commandTree = initCommands();

commandTree.getValidInput = (availableInputs, msg) =>
{
	for(const input of availableInputs)
	{
		if(input.condition(msg))
		{
			return input;
		}
	}
}

function initCommands()
{
	const map = new Map();
	
	map.set("", [ start ]);
	map.set(start.id, [ selectPartner ]);
	map.set(selectPartner.id, [ selectCourse ]);
	
	return map;
}

mstBot.on("message", async msg =>
{
	let session = sessions.get(msg.from.id);

	if(!session)
	{
		session = { id: msg.from.id, lastCmd: "" };
		sessions.set(msg.from.id, session);
	}

	const lastCmd = session.lastCmd;

	const availableInputs = commandTree.get(lastCmd);
	const validInput = commandTree.getValidInput(availableInputs, msg);

	if(!validInput)
	{
		mstBot.sendMessage(msg.from.id, "Пожалуйста введите одно из: " + availableInputs.map(i => i.name).join(", "));
	}
	else
	{
		if(await validInput.action(msg))
		{
			session.lastCmd = validInput.id;
		}
	}
});

async function getUser(msg)
{
	return await User.findOne({ uid: msg.from.id });
}