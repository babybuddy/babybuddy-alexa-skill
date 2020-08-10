const Alexa = require('ask-sdk-core');

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    if (null != handlerInput.requestEnvelope.request.error) {
      console.log(JSON.stringify(handlerInput.requestEnvelope.request.error));
    }

    return handlerInput.responseBuilder.getResponse();
  }
};

module.exports = {
  SessionEndedRequestHandler
};