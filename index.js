const TFMstBot = require('node-telegram-bot-api')
const Mongo = require('mongoose')
const DotEnv = require('dotenv')

const { TOKEN, MONGOKEY } = DotEnv.config().parsed

const mstBot = new TFMstBot(TOKEN, { polling: true } )

mstBot.onText(/./, async msg => {
  mstBot.sendMessage(msg.chat.id, `Привет, ${msg.from.username}!`)
})
// const mongoStart = async (MONGOKEY) => {
//   try {
//     Mongo.connect(MONGOKEY)
//   } catch (e) {
//     console.log(e)
//   }
// } 
// mongoStart()

