import {
  getRequestType,
  getIntentName,
  RequestHandler,
  getSlotValue,
  getDialogState,
  getRequest,
} from 'ask-sdk-core';

import { IntentRequest } from 'ask-sdk-model';

import * as moment from 'moment';

import { babyBuddy } from '../babybuddy';

import {
  getSelectedChild,
} from './helpers';

const RecordSleepIntentHandler: RequestHandler = {
  canHandle(handlerInput) {
    return (
      getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      getIntentName(handlerInput.requestEnvelope) === 'RecordSleepIntent'
    );
  },
  async handle(handlerInput) {
    if (getDialogState(handlerInput.requestEnvelope) !== 'COMPLETED') {
      const request = getRequest<IntentRequest>(handlerInput.requestEnvelope);
      const intent = request.intent;

      return handlerInput.responseBuilder
        .addDelegateDirective(intent)
        .withShouldEndSession(false)
        .getResponse();
    }

    // AMAZON.DURATION gets provided as an ISO-8601 duration
    const durationISO8601 = getSlotValue(handlerInput.requestEnvelope, 'Duration');
    const duration = moment.duration(durationISO8601);

    const now = moment();
    const beginning = moment().subtract(duration);

    const name = getSlotValue(handlerInput.requestEnvelope, 'Name');

    const selectedChild = await getSelectedChild(name);

    if (!selectedChild) {
      return handlerInput.responseBuilder
        .speak(
          'Please specify which child by saying, Ask Baby Buddy to record sleep for Jack.'
        )
        .getResponse();
    }

    console.log(selectedChild);

    const speakOutput = `Recording sleep for ${selectedChild.first_name}`;

    await babyBuddy.createSleep(
      {
        child: selectedChild.id,
        start: beginning.toISOString(),
        end: now.toISOString()
      }
    );

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .withShouldEndSession(true)
      .getResponse();
  },
};

export { RecordSleepIntentHandler };
