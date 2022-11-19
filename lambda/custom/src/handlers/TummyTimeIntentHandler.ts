import {
  RequestHandler,
  getRequestType,
  getIntentName,
  getSlotValue,
} from "ask-sdk-core";

import { babyBuddy } from "../babybuddy";

import {
  TimerTypes,
  getTimersForIdentifier,
  getSelectedChild,
} from "./helpers";

const TummyTimeIntentHandler: RequestHandler = {
  canHandle(handlerInput) {
    return (
      getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      (getIntentName(handlerInput.requestEnvelope) === "StartTummyTimeIntent" ||
        getIntentName(handlerInput.requestEnvelope) === "StopTummyTimeIntent")
    );
  },
  async handle(handlerInput) {
    let speakOutput = "";

    const tummyTimeTimers = await getTimersForIdentifier(TimerTypes.TUMMY_TIME);

    const name = getSlotValue(handlerInput.requestEnvelope, "Name");

    const selectedChild = await getSelectedChild(name);

    if (!selectedChild) {
      return handlerInput.responseBuilder
        .speak(
          "Please specify which child by saying, Ask Baby Buddy to start tummy time for Jack."
        )
        .getResponse();
    }

    const selectedChildTimer = tummyTimeTimers.find(
      (timer) => timer.child === selectedChild.id
    );

    if (
      getIntentName(handlerInput.requestEnvelope) === "StartTummyTimeIntent"
    ) {
      if (selectedChildTimer) {
        speakOutput = `You already have a tummy time session started for ${selectedChild.first_name}`;
      } else {
        await babyBuddy.startTimer(TimerTypes.TUMMY_TIME, selectedChild.id);
        speakOutput = `Starting tummy time for ${selectedChild.first_name}`;
      }
    } else if (selectedChildTimer) {
      speakOutput = `Stopping tummy time for ${selectedChild.first_name}.`;
      await babyBuddy.createTummyTime({
        child: selectedChild.id,
        timer: selectedChildTimer.id,
      });
    } else {
      speakOutput = `You don't have a tummy time session started for ${selectedChild.first_name}`;
    }

    return handlerInput.responseBuilder.speak(speakOutput).getResponse();
  },
};

export { TummyTimeIntentHandler };
