import {
  RequestHandler,
  getRequestType,
  getIntentName,
  getSlotValue,
  getDialogState,
  getRequest,
  HandlerInput
} from 'ask-sdk-core';

import { IntentRequest, Response } from 'ask-sdk-model';

import { babyBuddy, Child, Timer } from '../babybuddy';

import {
  TimerTypes,
  getTimersForIdentifier,
  getSelectedChild,
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

type HandleDialogFunction = (handlerInput: HandlerInput) => Response;
type StartFeedingFunction = (selectedChild: Child, selectedChildTimer: Timer | undefined) => Promise<string>;
type StopFeedingFunction = (handlerInput: HandlerInput, selectedChild: Child, selectedChildTimer: Timer) => Promise<string>;

const handleDialog: HandleDialogFunction = (handlerInput: HandlerInput) => {
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
};

const startFeeding: StartFeedingFunction = async (selectedChild, selectedChildTimer) => {
  let speakOutput = '';

  if (selectedChildTimer) {
    speakOutput = `You already have a feeding started for ${selectedChild.first_name}`;
  } else {
    await babyBuddy.startTimer(TimerTypes.FEEDING, selectedChild.id);
    speakOutput = `Starting feeding for ${selectedChild.first_name}`;
  }

  return speakOutput;
};

const stopFeeding: StopFeedingFunction = async (handlerInput: HandlerInput, selectedChild: Child, selectedChildTimer: Timer) => {
  let speakOutput = `Stopping feeding for ${selectedChild.first_name}.`;
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

  return speakOutput;
};

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
      speakOutput = await startFeeding(selectedChild, selectedChildTimer);
    } else if (getDialogState(handlerInput.requestEnvelope) !== 'COMPLETED') {
      return handleDialog(handlerInput);
    } else if (selectedChildTimer) {
      speakOutput = await stopFeeding(handlerInput, selectedChild, selectedChildTimer);
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
