import {
  getRequestType,
  getIntentName,
  RequestHandler,
  getSlotValue,
  getDialogState,
  getRequest,
} from "ask-sdk-core";

import { IntentRequest } from "ask-sdk-model";

import * as moment from "moment";

import { babyBuddy, SimpleChildTimer } from "../babybuddy";

import { getSelectedChild } from "./helpers";

const RecordSimpleDurationIntentHandler: RequestHandler = {
  canHandle(handlerInput) {
    return (
      getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      (getIntentName(handlerInput.requestEnvelope) === "RecordSleepIntent" ||
        getIntentName(handlerInput.requestEnvelope) === "RecordTummyTimeIntent")
    );
  },

  async handle(handlerInput) {
    if (getDialogState(handlerInput.requestEnvelope) !== "COMPLETED") {
      const request = getRequest<IntentRequest>(handlerInput.requestEnvelope);
      const intent = request.intent;

      return handlerInput.responseBuilder
        .addDelegateDirective(intent)
        .withShouldEndSession(false)
        .getResponse();
    }

    // AMAZON.DURATION gets provided as an ISO-8601 duration
    const durationISO8601 = getSlotValue(
      handlerInput.requestEnvelope,
      "Duration"
    );
    const duration = moment.duration(durationISO8601);

    const action =
      getIntentName(handlerInput.requestEnvelope) === "RecordSleepIntent"
        ? "sleep"
        : "tummy time";

    const now = moment();
    const beginning = now.clone().subtract(duration);

    const name = getSlotValue(handlerInput.requestEnvelope, "Name");

    const selectedChild = await getSelectedChild(name);

    if (!selectedChild) {
      return handlerInput.responseBuilder
        .speak(
          `Please specify which child by saying, Ask Baby Buddy to record ${action} for Jack.`
        )
        .getResponse();
    }

    console.log(selectedChild);

    const apiInput: SimpleChildTimer = {
      child: selectedChild.id,
      start: beginning.toISOString(),
      end: now.toISOString(),
    };

    let output = "";
    if (action === "tummy time") {
      await babyBuddy.createTummyTime(apiInput);
      output = `Recorded tummy time for ${selectedChild.first_name}`;
    } else {
      await babyBuddy.createSleep(apiInput);
      output = `Recorded sleep for ${selectedChild.first_name}`;
    }

    return handlerInput.responseBuilder
      .speak(output)
      .withShouldEndSession(true)
      .getResponse();
  },
};

export { RecordSimpleDurationIntentHandler };
