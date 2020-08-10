const Alexa = require('ask-sdk-core');

const babyBuddy = require('../babybuddy');

const {
  TIMER_TYPES,
  getSelectedChild,
  getResolvedSlotValue,
  getMinutesFromDurationString
} = require('./helpers');

const TimerIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'CurrentTimerIntent' ||
        Alexa.getIntentName(handlerInput.requestEnvelope) === 'CancelTimerIntent');
  },
  async handle(handlerInput) {
    var speakOutput = '';

    const timer = getResolvedSlotValue(handlerInput.requestEnvelope, 'Timer');

    if (!timer) {
      speakOutput = `That is not a valid timer type.  Valid timer types are feeding, sleeping, and tummy time`;
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .withShouldEndSession(true)
        .getResponse();
    }

    const activeTimers = await babyBuddy.getActiveTimers();
    const inquiredTimer = activeTimers.filter(t => t.name === timer).find(x => x !== undefined);

    if (inquiredTimer) {
      if (Alexa.getIntentName(handlerInput.requestEnvelope) === 'CancelTimerIntent') {
        await babyBuddy.destroyTimer(inquiredTimer.id);
        speakOutput = `Your ${timer} timer has been cancelled.`;
      } else {
        const minutes = getMinutesFromDurationString(inquiredTimer.duration);
        speakOutput = `Your ${timer} timer has been active for about ${minutes} ${minutes == 1 ? 'minute' : 'minutes'}.`;
      }
    } else {
      speakOutput = `You don't currently have any ${timer} timers running.`;
    }

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .withShouldEndSession(true)
      .getResponse();
  }
};

module.exports = {
  TimerIntentHandler
};
