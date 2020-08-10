const { CancelAndStopIntentHandler } = require('./CancelAndStopIntentHandler');
const { TimerIntentHandler } = require('./TimerHandler');
const { DiaperChangeIntentHandler } = require('./DiaperChangeHandler');
const { ErrorHandler } = require('./ErrorHandler');
const { FeedingIntentHandler } = require('./FeedingHandler');
const { HelpIntentHandler } = require('./HelpIntentHandler');
const { IntentReflectorHandler } = require('./IntentReflectorHandler');
const { LastFeedingIntentHandler } = require('./LastFeedingHandler');
const { LaunchRequestHandler } = require('./LaunchRequestHandler');
const { SessionEndedRequestHandler } = require('./SessionEndedRequestHandler');
const { SleepIntentHandler } = require('./SleepHandler');
const { TummyTimeIntentHandler } = require('./TummyTimeHandler');

module.exports = {
  CancelAndStopIntentHandler,
  TimerIntentHandler,
  DiaperChangeIntentHandler,
  ErrorHandler,
  FeedingIntentHandler,
  LastFeedingIntentHandler,
  HelpIntentHandler,
  IntentReflectorHandler,
  LaunchRequestHandler,
  SessionEndedRequestHandler,
  SleepIntentHandler,
  TummyTimeIntentHandler,
};