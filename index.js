const TFMstBot = require('node-telegram-bot-api');
const Mongo = require('mongoose');
const DotEnv = require('dotenv');
const initInputTree = require('./models/InputTree')
const User = require("./models/User");
const Partner = require("./models/Partners");
const Course = require("./models/Course");
const { start: StartCmd, selectPartner: SelectPartnerInput, selectCourse: SelectCourseInput} = require('./controller/CommandController')
const { partnerButtons } = require('./utils')

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

const sessions = new Map();

const inputTree = initInputTree();
inputTree.getValidInput = (availableInputs, msg) => {
	for (let input of availableInputs) {
		if (input.condition(msg)) {
			return input;
		}
	}
}


mstBot.on("message", async msg => {
	let session = sessions.get(msg.from.id);

	if (!session) {
		session = { id: msg.from.id, lastCmd: "" };
		sessions.set(msg.from.id, session);
	}

	const lastCmd = session.lastCmd;

	const availableInputs = inputTree.get(lastCmd);
	const validInput = inputTree.getValidInput(availableInputs, msg);

	if (!validInput) {
		mstBot.sendMessage(msg.from.id, "Пожалуйста введите одно из: " + availableInputs.map(i => i.name).join(", "));
	} else {
		if (await validInput.action(msg, mstBot)) {
			session.lastCmd = validInput.id;
		}
	}
});