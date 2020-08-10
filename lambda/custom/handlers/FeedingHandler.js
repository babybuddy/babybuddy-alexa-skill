const Alexa = require('ask-sdk-core');

const babyBuddy = require('../babybuddy');

const {
  TIMER_TYPES,
  getTimersForIdentifier,
  getSelectedChild,
  getResolvedSlotValue
} = require('./helpers');

const FeedingIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'StartFeedingIntent' ||
        Alexa.getIntentName(handlerInput.requestEnvelope) === 'StopFeedingIntent');
  },
  async handle(handlerInput) {
    var speakOutput = '';

    const feedingTimers = await getTimersForIdentifier(TIMER_TYPES.FEEDING);

    const name = Alexa.getSlotValue(handlerInput.requestEnvelope, 'Name');

    const selectedChild = await getSelectedChild(name);

    if (!selectedChild) {
      return handlerInput.responseBuilder
        .speak('Please specify which child by saying, Ask Baby Buddy to start feeding for Jack.')
        .getResponse();
    }

    const selectedChildTimer = feedingTimers.find(timer => timer.child === selectedChild.id);

    if (Alexa.getIntentName(handlerInput.requestEnvelope) === 'StartFeedingIntent') {
      if (selectedChildTimer) {
        speakOutput = `You already have a feeding started for ${selectedChild.first_name}`;
      } else {
        await babyBuddy.startTimer(TIMER_TYPES.FEEDING, selectedChild.id);
        speakOutput = `Starting feeding for ${selectedChild.first_name}`
      }
    } else if (selectedChildTimer) {
      speakOutput = `Stopping feeding for ${selectedChild.first_name}.`;
      console.log(`slots: ${JSON.stringify(handlerInput.requestEnvelope.request.intent.slots)}`)

      var type = 'breast milk';
      const typeResolvedSlot = getResolvedSlotValue(handlerInput.requestEnvelope, 'Type');

      if (typeResolvedSlot) {
        type = typeResolvedSlot;
      } else {
        speakOutput += `  I had trouble recording the feeding type.  Setting to ${type}.`;
      }

      var method = 'bottle';
      const methodResolvedSlot = getResolvedSlotValue(handlerInput.requestEnvelope, 'Method');

      if (methodResolvedSlot) {
        method = methodResolvedSlot;
      } else {
        speakOutput += `  I had trouble recording the feeding type.  Setting to ${method}.`;
      }

      var amount = 0;
      const amountString = Alexa.getSlotValue(handlerInput.requestEnvelope, 'Amount');

      if (amountString === '?') {
        speakOutput += '  I had trouble recording the feeding amount.  Setting to 0.'
        amount = 0;
      } else {
        amount = parseInt(amountString);
      }

      console.log(`child: ${selectedChild.id}, timer: ${selectedChildTimer.id}, type: ${type}, method: ${method}, amountString: ${amountString}`);

      await babyBuddy.createFeeding(selectedChild.id, selectedChildTimer.id, type, method, amount);
    } else {
      speakOutput = `You don't have a feeding started for ${selectedChild.first_name}`;
    }

    console.log(`speakOutput: ${speakOutput}`);

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .withShouldEndSession(true)
      .getResponse();
  }
};

module.exports = {
  FeedingIntentHandler
};