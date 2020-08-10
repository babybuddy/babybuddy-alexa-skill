const Alexa = require('ask-sdk-core');

const babyBuddy = require('../babybuddy');

const {
  TIMER_TYPES,
  getTimersForIdentifier,
  getSelectedChild
} = require('./helpers');

const TummyTimeIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'StartTummyTimeIntent' ||
        Alexa.getIntentName(handlerInput.requestEnvelope) === 'StopTummyTimeIntent');
  },
  async handle(handlerInput) {
    var speakOutput = '';

    const tummyTimeTimers = await getTimersForIdentifier(TIMER_TYPES.TUMMY_TIME);

    const name = Alexa.getSlotValue(handlerInput.requestEnvelope, 'Name');

    const selectedChild = await getSelectedChild(name);

    if (!selectedChild) {
      return handlerInput.responseBuilder
        .speak('Please specify which child by saying, Ask Baby Buddy to start tummy time for Jack.')
        .getResponse();
    }

    const selectedChildTimer = tummyTimeTimers.find(timer => timer.child === selectedChild.id);

    if (Alexa.getIntentName(handlerInput.requestEnvelope) === 'StartTummyTimeIntent') {
      if (selectedChildTimer) {
        speakOutput = `You already have a tummy time session started for ${selectedChild.first_name}`;
      } else {
        await babyBuddy.startTimer(TIMER_TYPES.TUMMY_TIME, selectedChild.id);
        speakOutput = `Starting tummy time for ${selectedChild.first_name}`
      }
    } else if (selectedChildTimer) {
      speakOutput = `Stopping tummy time for ${selectedChild.first_name}.`;
      await babyBuddy.createTummyTime(selectedChild.id, selectedChildTimer.id);
    } else {
      speakOutput = `You don't have a tummy time session started for ${selectedChild.first_name}`;
    }

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse();
  }
};

module.exports = {
  TummyTimeIntentHandler
};