import {
  getRequestType,
  getIntentName,
  RequestHandler,
  getSlotValue,
} from 'ask-sdk-core';

import babyBuddy from '../babybuddy';

import { getSelectedChild, getResolvedSlotValue } from './helpers';

const DiaperChangeIntentHandler: RequestHandler = {
  canHandle(handlerInput) {
    return (
      getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      getIntentName(handlerInput.requestEnvelope) === 'RecordDiaperChangeIntent'
    );
  },
  async handle(handlerInput) {
    let speakOutput = '';

    const name = getSlotValue(handlerInput.requestEnvelope, 'Name');

    let wet = false;
    const wetResolvedSlot = getResolvedSlotValue(
      handlerInput.requestEnvelope,
      'Wet'
    );

    if (wetResolvedSlot) {
      wet = wetResolvedSlot === 'yes';
    } else {
      speakOutput +=
        '  I had trouble recording whether the diaper was wet.  Setting to false.';
    }

    let solid = false;
    const solidResolvedSlot = getResolvedSlotValue(
      handlerInput.requestEnvelope,
      'Solid'
    );

    if (solidResolvedSlot) {
      solid = solidResolvedSlot === 'yes';
    } else {
      speakOutput +=
        '  I had trouble recording whether the diaper was solid.  Setting to false.';
    }

    const color = getSlotValue(handlerInput.requestEnvelope, 'Color');
    const amountString = getSlotValue(handlerInput.requestEnvelope, 'Amount');

    const selectedChild = await getSelectedChild(name);

    if (!selectedChild) {
      return handlerInput.responseBuilder
        .speak(
          'Please specify which child by saying, Ask Baby Buddy to record diaper change for Jack.'
        )
        .getResponse();
    }

    speakOutput = `Recording diaper change for ${selectedChild.first_name}`;

    let amount = 0;

    if (amountString === '?') {
      speakOutput +=
        '  I had trouble recording the amount.  Please update the value through the web interface.';
      amount = 0;
    } else {
      amount = parseInt(amountString);
    }

    await babyBuddy.createDiaperChange({
      child: selectedChild.id,
      wet,
      solid,
      color,
      amount,
    });

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .withShouldEndSession(true)
      .getResponse();
  },
};

export { DiaperChangeIntentHandler };
