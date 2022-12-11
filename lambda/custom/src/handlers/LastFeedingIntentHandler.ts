import {
  RequestHandler,
  getRequestType,
  getIntentName,
  getSlotValue,
} from "ask-sdk-core";

import * as moment from "moment";

import { babyBuddy } from "../babybuddy";

import { getSelectedChild, getMinutesFromDurationString } from "./helpers";

const LastFeedingIntentHandler: RequestHandler = {
  canHandle(handlerInput) {
    return (
      getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      getIntentName(handlerInput.requestEnvelope) === "LastFeedingIntent"
    );
  },
  async handle(handlerInput) {
    const name = getSlotValue(handlerInput.requestEnvelope, "Name");

    console.log(`name: ${name}`);

    const selectedChild = await getSelectedChild(name);

    console.log(`selectedChild: ${JSON.stringify(selectedChild)}`);

    if (!selectedChild) {
      return handlerInput.responseBuilder
        .speak(
          "Please specify which child by saying, Ask Baby Buddy when did Jack eat last."
        )
        .getResponse();
    }

    const lastFeeding = await babyBuddy.getLastFeeding(selectedChild.id);

    if (!lastFeeding) {
      return handlerInput.responseBuilder
        .speak(
          "Please specify which child by saying, Ask Baby Buddy when did Jack eat last."
        )
        .getResponse();
    }

    console.log(`lastFeeding: ${JSON.stringify(lastFeeding)}`);

    const { start, duration, amount } = lastFeeding;

    const startDate = moment.parseZone(start);

    console.log(`startDate: ${JSON.stringify(startDate)}`);

    const timeString = startDate.format("hh:mm A");

    console.log(`timeString: ${timeString}`);

    const minutes = getMinutesFromDurationString(duration);

    console.log(`minutes: ${minutes}`);

    let speakOutput = `${selectedChild.first_name} last started eating at ${timeString}`;
    speakOutput += `, ate for ${minutes} ${
      minutes === 1 ? "minute" : "minutes"
    }`;

    if (amount !== null) {
      speakOutput += `, and ate ${amount} ${
        amount === 1 ? "ounce" : "ounces"
      }.`;
    }

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .withShouldEndSession(true)
      .getResponse();
  },
};

export { LastFeedingIntentHandler };
