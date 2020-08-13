import {
  RequestHandler,
  getRequestType,
  getIntentName,
  getSlotValue,
} from 'ask-sdk-core';

import babyBuddy from '../babybuddy';

import {
  TimerTypes,
  getTimersForIdentifier,
  getSelectedChild,
  getResolvedSlotValue,
} from './helpers';

const FeedingIntentHandler: RequestHandler = {
  canHandle(handlerInput) {
    return (
      getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      (getIntentName(handlerInput.requestEnvelope) === 'StartFeedingIntent' ||
        getIntentName(handlerInput.requestEnvelope) === 'StopFeedingIntent')
    );
  },
  async handle(handlerInput) {
    let speakOutput = '';

    const feedingTimers = await getTimersForIdentifier(TimerTypes.FEEDING);

    const name = getSlotValue(handlerInput.requestEnvelope, 'Name');

    const selectedChild = await getSelectedChild(name);

    if (!selectedChild) {
      return handlerInput.responseBuilder
        .speak(
          'Please specify which child by saying, Ask Baby Buddy to start feeding for Jack.'
        )
        .getResponse();
    }

    const selectedChildTimer = feedingTimers.find(
      timer => timer.child === selectedChild.id
    );

    if (getIntentName(handlerInput.requestEnvelope) === 'StartFeedingIntent') {
      if (selectedChildTimer) {
        speakOutput = `You already have a feeding started for ${selectedChild.first_name}`;
      } else {
        await babyBuddy.startTimer(TimerTypes.FEEDING, selectedChild.id);
        speakOutput = `Starting feeding for ${selectedChild.first_name}`;
      }
    } else if (selectedChildTimer) {
      speakOutput = `Stopping feeding for ${selectedChild.first_name}.`;
      console.log(
        `requestEnvelope: ${JSON.stringify(handlerInput.requestEnvelope)}`
      );

      let type = 'breast milk';
      const typeResolvedSlot = getResolvedSlotValue(
        handlerInput.requestEnvelope,
        'Type'
      );

      if (typeResolvedSlot) {
        type = typeResolvedSlot;
      } else {
        speakOutput += `  I had trouble recording the feeding type.  Setting to ${type}.`;
      }

      let method = 'bottle';
      const methodResolvedSlot = getResolvedSlotValue(
        handlerInput.requestEnvelope,
        'Method'
      );

      if (methodResolvedSlot) {
        method = methodResolvedSlot;
      } else {
        speakOutput += `  I had trouble recording the feeding type.  Setting to ${method}.`;
      }

      let amount = 0;
      const amountString = getSlotValue(handlerInput.requestEnvelope, 'Amount');

      if (amountString === '?') {
        speakOutput +=
          '  I had trouble recording the feeding amount.  Setting to 0.';
        amount = 0;
      } else {
        amount = parseInt(amountString);
      }

      console.log(
        `child: ${selectedChild.id}, timer: ${selectedChildTimer.id}, type: ${type}, method: ${method}, amountString: ${amountString}`
      );

      await babyBuddy.createFeeding({
        child: selectedChild.id,
        timer: selectedChildTimer.id,
        type,
        method,
        amount,
      });
    } else {
      speakOutput = `You don't have a feeding started for ${selectedChild.first_name}`;
    }

    console.log(`speakOutput: ${speakOutput}`);

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .withShouldEndSession(true)
      .getResponse();
  },
};

export {FeedingIntentHandler};
