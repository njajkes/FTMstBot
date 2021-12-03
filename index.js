const TFMstBot = require('node-telegram-bot-api')
const Mongo = require('mongoose')
const DotEnv = require('dotenv')
const Users = require('./models/User')

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

mstBot.onText(/\/start/, async msg => {
  const candidate = await Users.findOne({
    uid: msg.from.id
  })
  console.log(candidate)
  if (!candidate) {
    const newUser = new Users({
      uid: msg.from.id,
      role: 'Slave',
    })
    newUser.save()
    mstBot.sendMessage(msg.chat.id, "")
    
  } else {
    mstBot.sendMessage(msg.chat.id, `Здравствуйте, @${msg.from.username} ${candidate.role}`)
  }
})