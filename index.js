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

inputTree.getValidInput = async (availableInputs, msg, session) =>
{
	if (!availableInputs) {
		mstBot.sendMessage(msg.chat.id, "Whoops!")
		return undefined;
	}
	for (let input of availableInputs) {
		let cond = await input.condition(msg, session)
		if (cond) {
			return input;
		}
	}
}

mstBot.on("message", async msg => {
	const session = getOrMakeSession(msg);
	if (!msg.text) {
		mstBot.sendMessage(msg.from.id, 'Пожалуйста, вводите только текстовые команды.\nНаш бот пока что не научился понимать что-то помимо него :(');
		return
	}
	let availableInputs = inputTree.get(session.lastCmd)(msg, session);
	const validInput = await inputTree.getValidInput(availableInputs, msg, session);

	if(validInput && await validInput.action(msg, mstBot, session))
	{
		session.lastCmd = validInput.id;
	}

	mstBot.sendMessage(msg.from.id, "Пожалуйста введите одно из: \n    " + await availableNames(msg, inputTree.get(session.lastCmd)(msg, session), session));
});

async function availableNames(msg, availableInputs, session)
{
	const availablePromises = availableInputs.map(i => i.nameFunc(msg, session));
	let availableNames = await Promise.all(availablePromises);
	return availableNames.filter(i => i).join("\n    ");
}