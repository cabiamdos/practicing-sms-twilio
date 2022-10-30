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
const { request } = require('http');

const server = express();


server.use(bodyParser.urlencoded({ extended: true }));
server.use(session({secret: process.env.SESSION_SECRET}));

const port = process.env.EXPRESS_PORT || 3001;

server.get('/test', (req, res) => {
  res.send('hello from express')
});

// we need to configure this endpoint in twilio webhooks API
server.post('/receive-sms', (req, res) => {
  // in twilio the content of the message is extracted by the capital B in Body
  const messageContent = req.body.Body;
  const state = request.session.step;

  console.log('body', messageContent);
  console.state('state', state)

  let message;
  if (!state) {
    req.session.step = 1;
    message = `Hi, do you want to book an appointment to: \n see the gym \n
    book a personal trainer \n
    book a massage`;
  } else {
    // req.session.step = 2;
    switch(state) {
      case 1:
        if (messageContent.includes('gym')) {
          request.session.type = 'gym';
        } else if (messageContent.includes('personal')) {
          request.session.type = 'personal trainer'
        } else if (messageContent.includes('massage')) {
          request.session.type = 'masseur';
        }
        if(!request.session.type) {
          message = `Sorry I didn't understand your request`
        } else {
          req.session.step = 2;
          message = `What date do you want to appoint the ${request.session.type}`
        }
        // message = 'step 1'
        console.log('step 1');
        break;
      case 2:
        message = 'step 2'
        req.session.step = 3;
        console.log('step 2');
        break;
      default:
        console.log(`Could not find the step for values: ${state}`);
    }
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
