import {
  getRequestType,
  getIntentName,
  RequestHandler,
  getSlotValue,
  getDialogState,
  getRequest,
} from 'ask-sdk-core';

import { IntentRequest } from 'ask-sdk-model';

import { babyBuddy, CreateDiaperChange } from '../babybuddy';

import {
  getSelectedChild,
} from './helpers';

const DiaperChangeIntentHandler: RequestHandler = {
  canHandle(handlerInput) {
    return (
      getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      getIntentName(handlerInput.requestEnvelope) === 'RecordDiaperChangeIntent'
    );
  },
  async handle(handlerInput) {
    if (getDialogState(handlerInput.requestEnvelope) !== 'COMPLETED') {
      const wetValue = getSlotValue(handlerInput.requestEnvelope, 'Wet');
      const solidValue = getSlotValue(handlerInput.requestEnvelope, 'Solid');
      const shouldAddMoreDetails = getSlotValue(handlerInput.requestEnvelope, 'ShouldAddMoreDetails');

      const request = getRequest<IntentRequest>(handlerInput.requestEnvelope);
      const intent = request.intent;

      if (wetValue === 'no' && solidValue === 'no') {
        return handlerInput.responseBuilder
          .speak(
            'In order to record a diaper change, it must be either wet, or solid, or both.'
          )
          .withShouldEndSession(true)
          .getResponse();
      }

      if (shouldAddMoreDetails === 'no') {
        if (intent && intent.slots) {
          intent.slots.Color.value = 'yellow';
          intent.slots.Amount.value = '0';
        }

        return handlerInput.responseBuilder
          .addDelegateDirective(intent)
          .withShouldEndSession(false)
          .getResponse();
      }

      return handlerInput.responseBuilder
        .addDelegateDirective()
        .withShouldEndSession(false)
        .getResponse();
    }

    let speakOutput = '';

    const name = getSlotValue(handlerInput.requestEnvelope, 'Name');

    console.log(`name: ${name}`);

    const wetValue = getSlotValue(handlerInput.requestEnvelope, 'Wet');
    const solidValue = getSlotValue(handlerInput.requestEnvelope, 'Solid');

    console.log(`wetValue: ${wetValue}`);
    console.log(`solidValue: ${solidValue}`);

    const wet = wetValue === 'yes';
    const solid = solidValue === 'yes';

    console.log(`wet: ${wet}`);
    console.log(`solid: ${solid}`);

    const shouldAddMoreDetails = getSlotValue(handlerInput.requestEnvelope, 'ShouldAddMoreDetails') === 'yes';

    const color = getSlotValue(handlerInput.requestEnvelope, 'Color');
    const amountString = getSlotValue(handlerInput.requestEnvelope, 'Amount');

    console.log(`color: ${color}`);
    console.log(`amountString: ${amountString}`);

    const selectedChild = await getSelectedChild(name);

    if (!selectedChild) {
      return handlerInput.responseBuilder
        .speak(
          'Please specify which child by saying, Ask Baby Buddy to record diaper change for Jack.'
        )
        .getResponse();
    }

    speakOutput = `Recording diaper change for ${selectedChild.first_name}`;

    const payload: CreateDiaperChange = {
      child: selectedChild.id,
      wet,
      solid
    };

    if (shouldAddMoreDetails) {
      payload.color = color;

      let amount = 0;

      if (amountString === '?') {
        speakOutput +=
          '  I had trouble recording the amount.  Please update the value through the web interface.';
        amount = 0;
      } else {
        amount = parseInt(amountString);
        payload.amount = amount;
      }
    }

    const response = await babyBuddy.createDiaperChange(payload);
    console.log(response);

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .withShouldEndSession(true)
      .getResponse();
  },
};

export { DiaperChangeIntentHandler };
