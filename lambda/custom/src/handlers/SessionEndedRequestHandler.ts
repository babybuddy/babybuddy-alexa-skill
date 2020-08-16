import { getRequestType, RequestHandler } from 'ask-sdk-core';

const SessionEndedRequestHandler: RequestHandler = {
  canHandle(handlerInput) {
    return (
      getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest'
    );
  },
  handle(handlerInput) {
    console.log('\n******************* SessionEnded **********************');
    console.log('\n' + JSON.stringify(handlerInput.requestEnvelope, null, 2));

    return handlerInput.responseBuilder.getResponse();
  },
};

export { SessionEndedRequestHandler };
