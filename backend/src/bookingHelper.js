const matchType = (request, messageContent) =>  {
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
  return message;

}

const matchDay = (req, messageContent, weekdays) => {
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

  // message = 'step 2'
  console.log('step 2');
  return message;

}

const matchTime = (req, messageContent, hourRegex) => {
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

  return message;
}

const confirmBooking = (req) => {
  const {type, weekday, time} = req.session;
  message = `your appointment is booked to see the ${type} on ${weekday} at ${time}. If you want to change it please contact us at 555-5555`;

  return message;
}


module.exports = {
  matchType,
  matchDay,
  matchTime,
  confirmBooking
}