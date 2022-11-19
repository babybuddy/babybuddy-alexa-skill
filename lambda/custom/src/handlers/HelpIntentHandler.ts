import { RequestHandler, getRequestType, getIntentName } from "ask-sdk-core";

const HelpIntentHandler: RequestHandler = {
  canHandle(handlerInput) {
    return (
      getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      getIntentName(handlerInput.requestEnvelope) === "AMAZON.HelpIntent"
    );
  },
  handle(handlerInput) {
    const speakOutput =
      "You can say things like, start feeding, stop feeding, log diaper change, start sleeping, stop sleeping, start tummy time, or stop tummy time.";

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .withShouldEndSession(true)
      .getResponse();
  },
};

export { HelpIntentHandler };
