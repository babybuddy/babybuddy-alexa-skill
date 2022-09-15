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
      const contentsValue = getSlotValue(handlerInput.requestEnvelope, 'Contents');

      const request = getRequest<IntentRequest>(handlerInput.requestEnvelope);
      const intent = request.intent;

      console.log(`contents value: ${contentsValue}`);

      if (contentsValue !== undefined) {
        if (intent && intent.slots) {
          if (contentsValue == 'wet' || contentsValue == 'full') {
            intent.slots.Wet.value = 'yes';
          } else {
            intent.slots.Wet.value = 'no';
          }

          if (contentsValue == 'solid' || contentsValue == 'full') {
            intent.slots.Solid.value = 'yes';
          } else {
            intent.slots.Solid.value = 'no';
          }
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

    const shouldAddMoreDetails = getSlotValue(handlerInput.requestEnvelope, 'ShouldAddMoreDetails') === 'yes';

    console.log(`shouldAddMoreDetails: ${shouldAddMoreDetails}`);

    if (shouldAddMoreDetails) {
      // Prompt each individual attribute individually now.
      // TODO: Maybe skip some of the questions depending on whether it's wet / solid / full / empty?
      if (getSlotValue(handlerInput.requestEnvelope, 'Wet') === undefined) {
        console.log("Prompting for wet value");
        return handlerInput.responseBuilder
          .speak("Was it wet?")
          .addElicitSlotDirective('Wet')
          .getResponse();
      } else if (getSlotValue(handlerInput.requestEnvelope, 'Solid') === undefined) {
        console.log("Prompting for solid value");
        return handlerInput.responseBuilder
          .speak("Was it solid?")
          .addElicitSlotDirective('Solid')
          .getResponse();
      } else if (getSlotValue(handlerInput.requestEnvelope, 'Color') === undefined) {
        console.log("Prompting for color value");
        return handlerInput.responseBuilder
          .speak("Was it brown, black, green, or yellow?")
          .addElicitSlotDirective('Color')
          .getResponse();
      } else if (getSlotValue(handlerInput.requestEnvelope, 'Amount') === undefined) {
        console.log("Prompting for amount value");
        return handlerInput.responseBuilder
          .speak("How many ounces?")
          .addElicitSlotDirective('Amount')
          .getResponse();
      }
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
