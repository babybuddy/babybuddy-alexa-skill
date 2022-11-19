import {
  RequestHandler,
  getRequestType,
  getIntentName,
  getSlotValue,
} from "ask-sdk-core";

import { babyBuddy } from "../babybuddy";

import { getMinutesFromDurationString } from "./helpers";

const TimerIntentHandler: RequestHandler = {
  canHandle(handlerInput) {
    return (
      getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      (getIntentName(handlerInput.requestEnvelope) === "CurrentTimerIntent" ||
        getIntentName(handlerInput.requestEnvelope) === "CancelTimerIntent")
    );
  },
  async handle(handlerInput) {
    let speakOutput = "";

    const timer = getSlotValue(handlerInput.requestEnvelope, "Timer");

    const activeTimers = await babyBuddy.getActiveTimers();
    const inquiredTimer = activeTimers
      .filter((t) => t.name === timer)
      .find((x) => x !== undefined);

    if (inquiredTimer) {
      if (getIntentName(handlerInput.requestEnvelope) === "CancelTimerIntent") {
        await babyBuddy.destroyTimer(inquiredTimer.id);
        speakOutput = `Your ${timer} timer has been cancelled.`;
      } else {
        const minutes = getMinutesFromDurationString(inquiredTimer.duration);
        speakOutput = `Your ${timer} timer has been active for about ${minutes} ${
          minutes === 1 ? "minute" : "minutes"
        }.`;
      }
    } else {
      speakOutput = `You don't currently have any ${timer} timers running.`;
    }

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .withShouldEndSession(true)
      .getResponse();
  },
};

export { TimerIntentHandler };
