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
const weekdays = process.env.WEEKDAYS.split(',');
const hourRegex = /\b(\d?\d)\s?([aApP][mM])/g;

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
        const weekday = weekdays.filter(w => messageContent.toLowercase().includes(w));
        console.log('weekday', weekday);
        console.log('weekdays', weekdays);
        if (weekday.length === 0) {
          message = "I'm not sure what day of the week do you want to make a booking for"
        }
        else if (weekday.length > 1) {
          message = `Please select just one day for the booking do you prefer ${weekdays.join(', ')}`
        } else {
          req.session.step = 3;
          request.session.weekday = weekday[0];
          message = `Do you want to book it on ${weekday[0]}: \n 10am, 11am, 1pm 4pm`;
        }

        message = 'step 2'
        console.log('step 2');
        break;
      case 3: 
        const match = hourRegex.exec(messageContent);
        // '11pm', '11', 'pm'
        // valid date
        const {type, weekday} = req.session;
        console.log('match', match);
        if (match && match.length === 3) {
          req.session.step = 4;
          req.session.time = match[0];
          message = `Your appointment to see the ${type} on ${weekday} at ${match[0]} was made, please let us know if you need to change the time, otherwise see you than`
        } else {
          message = `Sorry I could not understand what time do you want to come to see ${type} on ${weekday}`
        }
        break;
      case 4:
        const {type, weekday, time} = req.session;
        message = `your appointment is booked to see the ${type} on ${weekday} at ${time}. If you want to change it please contact us at 555-5555`;
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
