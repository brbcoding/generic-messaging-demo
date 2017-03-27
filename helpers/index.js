const twilio = require('twilio')

const TWILIO_SID = process.env.TWILIO_SID || ' '
const TWILIO_TOKEN = process.env.TWILIO_TOKEN || ' '
const TWILIO_NUMBER = process.env.TWILIO_NUMBER || ' '

const client = new twilio.RestClient(TWILIO_SID, TWILIO_TOKEN)

module.exports = wss => {
  return {
    sendMessage: ({ to, body, mediaUrl = null }) => {
      return new Promise((resolve, reject) => {
        if(!isValid(TWILIO_SID) || !isValid(TWILIO_TOKEN) || !isValid(TWILIO_NUMBER)) {
          reject('Invalid TWILIO Environment. Please Check TWILIO_SID, TWILIO_TOKEN, and TWILIO_NUMBER')
        } else {
          client.messages.create(
          Object.assign(
            { body, to, from: TWILIO_NUMBER }, mediaUrl ? { mediaUrl } : null ),
              (err, message) => err ? reject(err) : resolve(message)
          )
        }
      })
    },
    broadcastSocketData: (data) => {
      return new Promise((resolve, reject) => {
        wss.clients.forEach(client => client.send(JSON.stringify(data)))
        resolve('Broadcast data')
      })
    }
  }
}

function isValid(val) {
  return val && val.replace(/\s/, '') !== ''
}