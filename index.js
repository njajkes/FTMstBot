const TFMstBot = require('node-telegram-bot-api');
const Mongo = require('mongoose');
const DotEnv = require('dotenv');
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

const commandTree = initCommands();
commandTree.getValidInput = (availableInputs, msg) =>
{
	for(const input of availableInputs) {
		if (input.condition(msg)) {
			return input;
		}
	}
}

function initCommands() {
	const map = new Map();
	
	map.set("", [ StartCmd ]);
	map.set(StartCmd.id, [ SelectPartnerInput ]);
	map.set(SelectPartnerInput.id, [ SelectCourseInput ]);
	
	return map;
}

mstBot.on("message", async msg => {
	let session = sessions.get(msg.from.id);

	if (!session) {
		session = { id: msg.from.id, lastCmd: "" };
		sessions.set(msg.from.id, session);
	}

	const lastCmd = session.lastCmd;

	const availableInputs = commandTree.get(lastCmd);
	const validInput = commandTree.getValidInput(availableInputs, msg);

	if (!validInput) {
		mstBot.sendMessage(msg.from.id, "Пожалуйста введите одно из: " + availableInputs.map(i => i.name).join(", "));
	} else {
		if (await validInput.action(msg, mstBot)) {
			session.lastCmd = validInput.id;
		}
	}
});