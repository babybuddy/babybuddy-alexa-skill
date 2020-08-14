import {
  RequestHandler,
  getRequestType,
  getIntentName,
  getSlotValue,
} from 'ask-sdk-core';

import babyBuddy from '../babybuddy';

import { TimerTypes, getTimersForIdentifier, getSelectedChild } from './helpers';

const SleepIntentHandler: RequestHandler = {
  canHandle(handlerInput) {
    return (
      getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      (getIntentName(handlerInput.requestEnvelope) === 'StartSleepingIntent' ||
        getIntentName(handlerInput.requestEnvelope) === 'StopSleepingIntent')
    );
  },
  async handle(handlerInput) {
    let speakOutput = '';

    const sleepingTimers = await getTimersForIdentifier(TimerTypes.SLEEPING);

    const name = getSlotValue(handlerInput.requestEnvelope, 'Name');

    const selectedChild = await getSelectedChild(name);

    if (!selectedChild) {
      return handlerInput.responseBuilder
        .speak(
          'Please specify which child by saying, Ask Baby Buddy to start sleeping session for Jack.'
        )
        .getResponse();
    }

    const selectedChildTimer = sleepingTimers.find(
      timer => timer.child === selectedChild.id
    );

    if (getIntentName(handlerInput.requestEnvelope) === 'StartSleepingIntent') {
      if (selectedChildTimer) {
        speakOutput = `You already have a sleeping session started for ${selectedChild.first_name}`;
      } else {
        await babyBuddy.startTimer(TimerTypes.SLEEPING, selectedChild.id);
        speakOutput = `Starting sleeping session for ${selectedChild.first_name}`;
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
  },
};

export { SleepIntentHandler };
