import { getSlot } from 'ask-sdk-core';
import { RequestEnvelope } from 'ask-sdk-model';

import {
  Timer,
  Child,
  babyBuddy,
} from '../babybuddy';

enum TimerTypes {
  FEEDING = 'feeding',
  SLEEPING = 'sleeping',
  TUMMY_TIME = 'tummy_time',
}

const getTimersForIdentifier: (identifier: string) => Promise<Timer[]> = async (identifier: string) => {
  const currentTimers = await babyBuddy.getActiveTimers();
  return currentTimers.filter(timer => timer.name === identifier);
};

const getSelectedChild: (name: string) => Promise<Child | undefined> = async (name: string) => {
  const response = await babyBuddy.getChildren();
  const children = response.results;

  if (name) {
    return children.find(child =>
      child.first_name.toLowerCase().includes(name)
    );
  } else if (children.length === 1) {
    return children[0];
  } else {
    return undefined;
  }
};

const getResolvedSlotValue: (requestEnvelope: RequestEnvelope, slotName: string) => string | undefined = (
  requestEnvelope: RequestEnvelope,
  slotName: string
) => {
  const slot = getSlot(requestEnvelope, slotName);
  const resolutions = slot.resolutions?.resolutionsPerAuthority;
  const resolution = resolutions?.find(x => x !== undefined);

  if (resolution?.status.code === 'ER_SUCCESS_MATCH') {
    const value = resolution.values.find(x => x !== undefined);
    return value?.value.name;
  } else {
    return undefined;
  }
};

const getMinutesFromDurationString: (duration: string) => number = (duration: string) => {
  const [hourString, minuteString, secondString] = duration.split(':');
  const minutes =
    parseInt(hourString) * 60 +
    parseInt(minuteString) +
    (parseFloat(secondString) >= 0 ? 1 : 0);
  return minutes;
};

export {
  TimerTypes,
  getTimersForIdentifier,
  getSelectedChild,
  getResolvedSlotValue,
  getMinutesFromDurationString,
};
