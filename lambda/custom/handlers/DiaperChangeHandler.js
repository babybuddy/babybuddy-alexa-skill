const Alexa = require('ask-sdk-core');

const babyBuddy = require('../babybuddy');

const {
  getSelectedChild
} = require('./helpers');

const SLEEPING_TIMER_NAME = 'sleeping';

const DiaperChangeIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'RecordDiaperChangeIntent';
  },
  async handle(handlerInput) {
    var speakOutput = '';

    const name = Alexa.getSlotValue(handlerInput.requestEnvelope, 'Name');
    const wet = Alexa.getSlotValue(handlerInput.requestEnvelope, 'Wet');
    const solid = Alexa.getSlotValue(handlerInput.requestEnvelope, 'Solid');
    const color = Alexa.getSlotValue(handlerInput.requestEnvelope, 'Color');
    const amountString = Alexa.getSlotValue(handlerInput.requestEnvelope, 'Amount');

    const selectedChild = await getSelectedChild(name);

    if (!selectedChild) {
      return handlerInput.responseBuilder
        .speak('Please specify which child by saying, Ask Baby Buddy to record diaper change for Jack.')
        .getResponse();
    }

    speakOutput = `Recording diaper change for ${selectedChild.first_name}`;

    var amount = 0;

    if (amountString === '?') {
      speakOutput += '  I had trouble recording the amount.  Please update the value through the web interface.'
      amount = 0;
    } else {
      amount = parseInt(amountString);
    }

    await babyBuddy.createDiaperChange(selectedChild.id, wet, solid, color, amount);

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .withShouldEndSession(true)
      .getResponse();
  }
};

module.exports = {
  DiaperChangeIntentHandler
};
