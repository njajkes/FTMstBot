const TFMstBot = require('node-telegram-bot-api')
const Mongo = require('mongoose')
const DotEnv = require('dotenv')
const Users = require('./models/User')
const Courses = require('./models/Course')
const Partners = require('./models/Partners')
const Contents = require('./models/Content')

const { TOKEN, MONGOKEY } = DotEnv.config().parsed

const mstBot = new TFMstBot(TOKEN, { polling: true } )

const mongoStart = async (MONGOKEY) => {
  try {
    Mongo.connect(MONGOKEY)
  } catch (e) {
    console.log(e)
  }
} 
mongoStart(MONGOKEY)

const startRegexp = /\/start/
const addPartnerRegexp = /\/addPartner/
const anyRegexp = /./ 

const partnerButtons = async msg =>
{
	let partners = await Partners.find();
	let partnerCmds = partners.map(p => [ p.companyName ]);
	
	return {
		reply_to_message_id: msg.message_id,
		reply_markup: { keyboard: partnerCmds }
	};
}

mstBot.onText(addPartnerRegexp, async msg => {
  mstBot.sendMessage(msg.chat.id, 'Введите название комании: ')
  mstBot.onText(anyRegexp, async (msg) => {
    try {
      console.log(msg.text)
      const newPartner = new Partners({
        companyName: msg.text
      })
      console.log(newPartner.companyName)
      await newPartner.save()
      
      console.log(`Партнёр ${newPartner.companyName} успешно добавлен`)
      await mstBot.sendMessage(msg.chat.id, `Компания ${newPartner.companyName} успешно добавлена!`)
      mstBot.removeTextListener(anyRegexp)
    } catch (e) {
      console.log(e)
      mstBot.sendMessage(msg.chat.id, 'Что-то пошло не так :(\nПопробуйте позже!')
    }
  })
  
})

mstBot.onText(startRegexp, async msg => {
  
  const candidate = await Users.findOne({
    uid: msg.from.id
  })
  if (!candidate) {

    const newUser = new Users({
      uid: msg.from.id,
      role: 'Slave',
    })

    newUser.save()

    mstBot.sendMessage(msg.chat.id, `Здравстуйте, ${msg.from.first_name}!\nПожалуйста, введите компанию, курсы которой хотите просматривать.`, await partnerButtons(msg))
    
  } else {
    mstBot.sendMessage(msg.chat.id, `Здравстуйте, ${msg.from.first_name}!\nПожалуйста, введите компанию, курсы которой хотите просматривать.`, await partnerButtons(msg))
  }
})

mstBot.onText(/\/partner (.+)/, async (msg, match) =>
{
	let user = await User.findOne({ uid: msg.from.id });

	if(!user)
	{
		mstBot.sendMessage(msg.chat.id, "Ошибка: пользователь не добавлен!");
		return;
	}

	let partnerName = match[1];
	let partner = await Partner.findOne({ companyName: partnerName });

	if(!partner)
	{
		mstBot.sendMessage(msg.chat.id, "Ошибка: компания не найдена!");
		return;
	}

	user.partners.push(partner);
	user.save();
	
	let courseNames = partner.coursesList.map(c => c.courseName).join(", ");

	mstBot.sendMessage(msg.chat.id, `Курсы от ${partnerName}: ${courseNames}`);
});
