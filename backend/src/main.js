const path = require('path');
// const alert = require('alert')
// alert('howdy');
require('dotenv').config({path:__dirname+'./../.env'});

const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');

const client = require('twilio')(
  process.env.ACCOUNT_SID,
  process.env.AUTH_TOKEN, 
);

const MessagingResponse = require('twilio').twiml.MessagingResponse;

const server = express();


server.use(bodyParser.urlencoded({ extended: true }));
server.use(session({secret: process.env.SESSION_SECRET}));

const port = process.env.EXPRESS_PORT || 3001;

server.get('/test', (req, res) => {
  res.send('hello from express')
});

server.post('/receive-sms', (req, res) => {
  const body = req.body;
  const state = request.cookies;

  console.log('body', body);
  console.state('state', state)

  let message;
  if (!state) {
    message = 'this is your first message';
  } else {
    message = 'this is your second message'
  }
  const twiml = new MessagingResponse();
  twiml.message(message);

  console.log(body);
  console.log('response', twiml.toString());
  res.set('Content-Type', "text/xml")
  res.send(twiml.toString())
})

server.listen(port, () => {
  console.log(`listening on port ${port}`);
})



console.log(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);

const sendSms = () => {
  client.messages
    .create({
       body: 'This is the ship that made the Kessel Run in fourteen parsecs?',
       from: process.env.PHONE_NUMBER,
       to: process.env.MY_NUMBER
     })
    .then(message => console.log('Message sent with sid', message.sid))
    .catch(err => console.log('error this doesnt work', err));
}

// this is how we use localtunnel
// localtunnel is a package to upload a website into a real domain
// lt --port 3001 --subdomain icarosms
