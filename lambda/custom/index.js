const Alexa = require('ask-sdk-core');

const result = require('dotenv').config({ path: 'lambda/custom/.env' });

if (result.error) {
  throw result.error
}

const {
  CancelAndStopIntentHandler,
  TimerIntentHandler,
  DiaperChangeIntentHandler,
  ErrorHandler,
  FeedingIntentHandler,
  HelpIntentHandler,
  IntentReflectorHandler,
  LastFeedingIntentHandler,
  LaunchRequestHandler,
  SessionEndedRequestHandler,
  SleepIntentHandler,
  TummyTimeIntentHandler,
} = require('./handlers');

exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    TimerIntentHandler,
    FeedingIntentHandler,
    SleepIntentHandler,
    DiaperChangeIntentHandler,
    TummyTimeIntentHandler,
    LastFeedingIntentHandler,
    LaunchRequestHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler,
    IntentReflectorHandler, // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
  )
  .addErrorHandlers(
    ErrorHandler,
  )
  .lambda();
