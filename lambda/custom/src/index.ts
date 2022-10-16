import { SkillBuilders } from 'ask-sdk-core';
import * as dotenv from 'dotenv';

const result = dotenv.config({ path: `${__dirname}/../.env` });

if (result.error) {
  throw result.error;
}

console.log(result.parsed);

import {
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
  TotalFeedingsIntentHandler,
  TummyTimeIntentHandler,
  RecordTummyTimeIntentHandler,
} from './handlers';

const handler = SkillBuilders.custom()
  .addRequestHandlers(
    TimerIntentHandler,
    FeedingIntentHandler,
    SleepIntentHandler,
    DiaperChangeIntentHandler,
    TummyTimeIntentHandler,
    LastFeedingIntentHandler,
    TotalFeedingsIntentHandler,
    LaunchRequestHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler,
    RecordTummyTimeIntentHandler,
    IntentReflectorHandler // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();

export { handler };
