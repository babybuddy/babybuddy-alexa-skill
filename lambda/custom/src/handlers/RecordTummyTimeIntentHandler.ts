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

const RecordTummyTimeIntentHandler: RequestHandler = {
  canHandle(handlerInput) {
    return (
      getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      getIntentName(handlerInput.requestEnvelope) === 'RecordTummyTimeIntent'
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
          'Please specify which child by saying, Ask Baby Buddy to record a feeding for Jack.'
        )
        .getResponse();
    }

    console.log(selectedChild);

    const speakOutput = `Recording tummy time for ${selectedChild.first_name}`;

    await babyBuddy.createTummyTime(
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

export { RecordTummyTimeIntentHandler };
