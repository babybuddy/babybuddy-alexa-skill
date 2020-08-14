import { getRequestType, RequestHandler } from 'ask-sdk-core';

const LaunchRequestHandler: RequestHandler = {
  canHandle(handlerInput) {
    return getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speakOutput =
      'Welcome to Baby Buddy, you can say Help to learn what you can do or just tell me. Which would you like to try?';
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};

export { LaunchRequestHandler };
