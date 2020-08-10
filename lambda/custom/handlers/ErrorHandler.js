const Alexa = require('ask-sdk-core');

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

    if (null != handlerInput.requestEnvelope.request.error) {
      console.log(JSON.stringify(handlerInput.requestEnvelope.request.error));
    }

    const speakOutput = `Sorry, I had trouble doing what you asked. Please try again.`;

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .withShouldEndSession(true)
      .getResponse();
  }
};

module.exports = {
  ErrorHandler
};