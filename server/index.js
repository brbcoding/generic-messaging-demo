const express = require('express')
const bodyParser = require('body-parser')
const http = require('http')
const WebSocket = require('ws')

const app = express()
const router = express.Router()
const server = http.createServer(app)
const wss = new WebSocket.Server({ server })

const helpers = require('../helpers')(wss)

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Demo-Auth-Token')
  next()
})

// test route
router.post('/echo', (req, res) => {
  res.send(req.body)
})

// sends a message using associated twilio account
router.post('/send_message', (req, res) => {
  if(req.body && req.body.to && req.body.body && req.get('Demo-Auth-Token') === 'S@lesforce2017') {
    helpers.sendMessage(req.body)
      .then(message => res.send(`Message Send: ${message.sid}`))
      .catch(err => res.send(err))
  }
})

router.post('/receive_message', (req, res) => {
  if(req.get('user-agent').toLowerCase().indexOf('twilio') > -1 && req.body && req.body.Body && req.body.From) {
    helpers.broadcastSocketData({ from: req.body.From, body: req.body.Body })
      .then(response => res.send(response))
      .catch(err => res.send(err))
  } else {
    res.send('Failed receiving message...')
  }
})

app.use(router)
app.use('/', express.static('./example'))

server.listen(process.env.PORT || 9001)