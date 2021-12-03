const TFMstBot = require('node-telegram-bot-api');
const Mongo = require('mongoose');
const DotEnv = require('dotenv');
const initInputTree = require('./models/InputTree')
const { start: StartCmd, selectPartner: SelectPartnerInput, selectCourse: SelectCourseInput} = require('./controller/CommandController')

const { TOKEN, MONGOKEY } = DotEnv.config().parsed;

const mstBot = new TFMstBot(TOKEN, { polling: true } )

const mongoStart = async (MONGOKEY) => {
  try {
    Mongo.connect(MONGOKEY)
  } catch (e) {
    console.log(e)
  }
}

mongoStart(MONGOKEY);

const sessions = new Map();

function getOrMakeSession(msg)
{
	let session = sessions.get(msg.from.id);

	if(!session)
	{
		session = { id: msg.from.id, lastCmd: "" };
		sessions.set(msg.from.id, session);
	}

	return session;
}

const inputTree = initInputTree();

inputTree.getValidInput = async (availableInputs, msg) =>
{
	if (!availableInputs) {
		mstBot.sendMessage(msg.chat.id, "Whoops!")
		return undefined;
	}
	for (let input of availableInputs) {
		if (await input.condition(msg)) {
			return input;
		}
	}
}

mstBot.on("message", async msg => {
	const session = getOrMakeSession(msg);

	const lastCmd = session.lastCmd;

	const availableInputs = inputTree.get(lastCmd);
	const validInput = await inputTree.getValidInput(availableInputs, msg);

	if (!validInput) {
		if (validInput == undefined) {
			mstBot.sendMessage(msg.from.id, "Что-то пошло не так!")
		} else {
		mstBot.sendMessage(msg.from.id, "Пожалуйста введите одно из: " + availableInputs.map(i => i.name).join(", "));
		}
	} else {
		if (await validInput.action(msg, mstBot)) {
			session.lastCmd = validInput.id;
		}
	}
});