import {
  RequestHandler,
  getRequestType,
  getIntentName,
  getSlotValue,
  getDialogState,
  getRequest
} from 'ask-sdk-core';

import { IntentRequest } from 'ask-sdk-model';

import { babyBuddy } from '../babybuddy';

import {
  TimerTypes,
  getTimersForIdentifier,
  getSelectedChild,
  getResolvedSlotValue,
} from './helpers';

enum FeedingType {
  FORMULA = 'formula',
  BREAST_MILK = 'breast milk',
  FORTIFIED_BREAST_MILK = 'fortified breast milk'
}

enum FeedingMethod {
  BOTTLE = 'bottle',
  LEFT_BREAST = 'left breast',
  RIGHT_BREAST = 'right breast',
  BOTH_BREASTS = 'both breasts'
}

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
    } else if (getDialogState(handlerInput.requestEnvelope) !== 'COMPLETED') {
      const type = getSlotValue(handlerInput.requestEnvelope, 'Type');

      if (type === FeedingType.FORMULA) {
        const request = getRequest<IntentRequest>(handlerInput.requestEnvelope);
        const intent = request.intent;
        if (intent && intent.slots) {
          intent.slots.Method.value = FeedingMethod.BOTTLE;
        }

        return handlerInput.responseBuilder
          .addDelegateDirective(intent)
          .withShouldEndSession(false)
          .getResponse();
      }

      return handlerInput.responseBuilder
        .addDelegateDirective()
        .getResponse();
    } else if (selectedChildTimer) {
      speakOutput = `Stopping feeding for ${selectedChild.first_name}.`;
      console.log(
        `requestEnvelope: ${JSON.stringify(handlerInput.requestEnvelope)}`
      );

      const type = getSlotValue(handlerInput.requestEnvelope, 'Type');
      const method = getSlotValue(handlerInput.requestEnvelope, 'Method');

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

export {
  FeedingIntentHandler
};
