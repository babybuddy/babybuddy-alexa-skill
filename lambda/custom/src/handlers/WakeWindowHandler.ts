import {
  RequestHandler,
  getRequestType,
  getIntentName,
  getSlotValue,
} from "ask-sdk-core";

import * as moment from "moment";

import { babyBuddy } from "../babybuddy";

import {
  getSelectedChild,
  getTimersForIdentifier,
  TimerTypes,
} from "./helpers";

const WakeWindowIntentHandler: RequestHandler = {
  canHandle(handlerInput) {
    return (
      getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      getIntentName(handlerInput.requestEnvelope) === "WakeWindowIntent"
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
          "Please specify which child by saying, Ask Baby Buddy how long Jack has been awake."
        )
        .getResponse();
    }

    const sleepTimers = await getTimersForIdentifier(TimerTypes.SLEEPING);

    const selectedChildTimer = sleepTimers.find(
      (timer) => timer.child === selectedChild.id
    );

    if (selectedChildTimer) {
      return handlerInput.responseBuilder
        .speak(`${selectedChild.first_name} is currently sleeping.`)
        .getResponse();
    }

    const lastSleep = await babyBuddy.getLastSleep(selectedChild.id);

    if (!lastSleep) {
      return handlerInput.responseBuilder
        .speak(
          `There is no recorded sleep session for ${selectedChild.first_name}`
        )
        .getResponse();
    }

    const now = moment();
    const humanDuration = moment.duration(now.diff(lastSleep.end)).humanize();
    const endFormatted = moment.parseZone(lastSleep.end).format("h:mm A");

    const speakOutput = `${selectedChild.first_name} has been awake for ${humanDuration}, starting at ${endFormatted}`;

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .withShouldEndSession(true)
      .getResponse();
  },
};

export { WakeWindowIntentHandler };
