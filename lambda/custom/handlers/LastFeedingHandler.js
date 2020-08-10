const Alexa = require('ask-sdk-core');
const moment = require('moment');

const babyBuddy = require('../babybuddy');

const {
  getSelectedChild,
  getMinutesFromDurationString
} = require('./helpers');

const LastFeedingIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'LastFeedingIntent';
  },
  async handle(handlerInput) {
    const name = Alexa.getSlotValue(handlerInput.requestEnvelope, 'Name');

    console.log(`name: ${name}`);

    const selectedChild = await getSelectedChild(name);

    console.log(`selectedChild: ${JSON.stringify(selectedChild)}`);

    if (!selectedChild) {
      return handlerInput.responseBuilder
        .speak('Please specify which child by saying, Ask Baby Buddy when did Jack eat last.')
        .getResponse();
    }

    const lastFeeding = await babyBuddy.getLastFeeding(selectedChild.id);

    console.log(`lastFeeding: ${JSON.stringify(lastFeeding)}`);

    const { start, duration, type, method, amount } = lastFeeding;

    const startDate = moment.parseZone(start);

    console.log(`startDate: ${JSON.stringify(startDate)}`);

    var timeString = startDate.format('hh:mm A');

    console.log(`timeString: ${timeString}`);

    const minutes = getMinutesFromDurationString(duration);

    console.log(`minutes: ${minutes}`);

    const speakOutput = `${selectedChild.first_name} last started eating at ${timeString}, ate for ${minutes} ${minutes == 1 ? 'minute' : 'minutes'}, and drank ${amount} ounces.`;

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .withShouldEndSession(true)
      .getResponse();
  }
};

module.exports = {
  LastFeedingIntentHandler
};