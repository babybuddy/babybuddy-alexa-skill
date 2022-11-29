import {
  RequestHandler,
  getRequestType,
  getIntentName,
  getSlotValue,
} from "ask-sdk-core";

import * as moment from "moment";

import { babyBuddy } from "../babybuddy";

import { getSelectedChild } from "./helpers";

const LastDiaperChangeIntentHandler: RequestHandler = {
  canHandle(handlerInput) {
    return (
      getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      getIntentName(handlerInput.requestEnvelope) === "LastDiaperChangeIntent"
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
          "Please specify which child by saying, Ask Baby Buddy when Jack last had a diaper change."
        )
        .getResponse();
    }

    const lastDiaperChange = await babyBuddy.getLastDiaperChange(
      selectedChild.id
    );

    if (!lastDiaperChange) {
      return handlerInput.responseBuilder
        .speak(
          "Please specify which child by saying, Ask Baby Buddy when Jack last had a diaper change."
        )
        .getResponse();
    }

    console.log(`lastDiaperChange: ${JSON.stringify(lastDiaperChange)}`);

    const { time, wet, solid } = lastDiaperChange;

    const changeTime = moment.parseZone(time);
    const changeTimeFormatted = changeTime.format("hh:mm A");

    let contents = "";
    if (wet && solid) {
      contents = "a full";
    } else if (wet) {
      contents = "a wet";
    } else if (solid) {
      contents = "a solid";
    } else {
      contents = "an empty";
    }

    const now = moment();
    const humanDuration = moment.duration(now.diff(changeTime)).humanize();

    const speakOutput = `${selectedChild.first_name} last had ${contents} diaper change ${humanDuration} ago at ${changeTimeFormatted}`;

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .withShouldEndSession(true)
      .getResponse();
  },
};

export { LastDiaperChangeIntentHandler };
