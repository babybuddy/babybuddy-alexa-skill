import { RequestHandler } from 'ask-sdk-core';

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler: RequestHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput) {
    console.log('\n******************* EXCEPTION **********************');
    console.log('\n' + JSON.stringify(handlerInput.requestEnvelope, null, 2));

    const speakOutput =
      'Sorry, I had trouble doing what you asked. Please try again.';

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .withShouldEndSession(true)
      .getResponse();
  },
};

export { ErrorHandler };
