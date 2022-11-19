import { getRequestType, getIntentName, RequestHandler } from "ask-sdk-core";

const CancelAndStopIntentHandler: RequestHandler = {
  canHandle(handlerInput) {
    return (
      getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      (getIntentName(handlerInput.requestEnvelope) === "AMAZON.CancelIntent" ||
        getIntentName(handlerInput.requestEnvelope) === "AMAZON.StopIntent")
    );
  },
  handle(handlerInput) {
    const speakOutput = "Goodbye!";
    return handlerInput.responseBuilder.speak(speakOutput).getResponse();
  },
};

export { CancelAndStopIntentHandler };
