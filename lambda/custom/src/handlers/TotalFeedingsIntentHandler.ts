import {
  RequestHandler,
  getRequestType,
  getIntentName,
  getSlotValue,
} from 'ask-sdk-core';

import * as moment from 'moment';

import { babyBuddy } from '../babybuddy';

import { getSelectedChild, getMinutesFromDurationString } from './helpers';

const TotalFeedingsIntentHandler: RequestHandler = {
  canHandle(handlerInput) {
    return (
      getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      getIntentName(handlerInput.requestEnvelope) === 'TotalFeedingsIntent'
    );
  },
  async handle(handlerInput) {
    const name = getSlotValue(handlerInput.requestEnvelope, 'Name');

    console.log(`name: ${name}`);

    const selectedChild = await getSelectedChild(name);

    console.log(`selectedChild: ${JSON.stringify(selectedChild)}`);

    if (!selectedChild) {
      return handlerInput.responseBuilder
        .speak(
          'Please specify which child by saying, Ask Baby Buddy when did Jack eat last.'
        )
        .getResponse();
    }

    const response = await babyBuddy.getFeedings(selectedChild.id);
    const feedings = response.results;

    const todaysFeedings = feedings.filter(feeding => {
      const startDate = moment.parseZone(feeding.start);
      const endDate = moment.parseZone(feeding.end);
      const todaysDate = moment();

      if (startDate.date() === todaysDate.date() &&
        startDate.month() === todaysDate.month() &&
        startDate.year() === todaysDate.year()) {
        return true;
      }

      if (endDate.date() === todaysDate.date() &&
        endDate.month() === todaysDate.month() &&
        endDate.year() === todaysDate.year()) {
        return true;
      }

      return false;
    });

    if (!todaysFeedings || todaysFeedings.length === 0) {
      return handlerInput.responseBuilder
        .speak(
          `${selectedChild.first_name} doesn\'t currently have any feedings recorded today.`
        )
        .getResponse();
    }

    console.log(`todaysFeedings: ${JSON.stringify(todaysFeedings)}`);

    const totalOunces = todaysFeedings.reduce((accumulator, currentValue) => {
      const amount = currentValue.amount ?? 0.0;
      accumulator += amount;
      return accumulator;
    }, 0.0);

    console.log(`todaysFeedings: ${todaysFeedings}`);

    const firstFeeding = todaysFeedings.pop();

    if (!firstFeeding) {
      return handlerInput.responseBuilder
        .speak(
          'I had trouble identifying the first feeding of the day.'
        )
        .getResponse();
    }

    const startDate = moment.parseZone(firstFeeding.start);

    console.log(`startDate: ${JSON.stringify(startDate)}`);

    const timeString = startDate.format('hh:mm A');

    let speakOutput = `Since ${timeString}, ${selectedChild.first_name} has eaten ${totalOunces}`;
    speakOutput += ` ${totalOunces === 1 ? 'ounce' : 'ounces'}.`;

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .withShouldEndSession(true)
      .getResponse();
  },
};

export { TotalFeedingsIntentHandler };
