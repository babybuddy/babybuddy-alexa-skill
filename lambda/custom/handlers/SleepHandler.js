const Alexa = require('ask-sdk-core');

const babyBuddy = require('../babybuddy');

const {
  TIMER_TYPES,
  getTimersForIdentifier,
  getSelectedChild
} = require('./helpers');

const SleepIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'StartSleepingIntent' ||
        Alexa.getIntentName(handlerInput.requestEnvelope) === 'StopSleepingIntent');
  },
  async handle(handlerInput) {
    var speakOutput = '';

    const sleepingTimers = await getTimersForIdentifier(TIMER_TYPES.SLEEPING);

    const name = Alexa.getSlotValue(handlerInput.requestEnvelope, 'Name');

    const selectedChild = await getSelectedChild(name);

    if (!selectedChild) {
      return handlerInput.responseBuilder
        .speak('Please specify which child by saying, Ask Baby Buddy to start sleeping session for Jack.')
        .getResponse();
    }

    const selectedChildTimer = sleepingTimers.find(timer => timer.child === selectedChild.id);

    if (Alexa.getIntentName(handlerInput.requestEnvelope) === 'StartSleepingIntent') {
      if (selectedChildTimer) {
        speakOutput = `You already have a sleeping session started for ${selectedChild.first_name}`;
      } else {
        await babyBuddy.startTimer(TIMER_TYPES.SLEEPING, selectedChild.id);
        speakOutput = `Starting sleeping session for ${selectedChild.first_name}`
      }
    } else if (selectedChildTimer) {
      speakOutput = `Stopping sleeping session for ${selectedChild.first_name}.`;
      await babyBuddy.createSleep(selectedChild.id, selectedChildTimer.id);
    } else {
      speakOutput = `You don't have a sleeping session started for ${selectedChild.first_name}`;
    }

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .withShouldEndSession(true)
      .getResponse();
  }
};

module.exports = {
  SleepIntentHandler
};