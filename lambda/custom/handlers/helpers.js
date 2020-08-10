const Alexa = require('ask-sdk-core');

const babyBuddy = require('../babybuddy');

const TIMER_TYPES = {
  FEEDING: 'feeding',
  SLEEPING: 'sleeping',
  TUMMY_TIME: 'tummy_time'
};

const getTimersForIdentifier = async (identifier) => {
  const currentTimers = await babyBuddy.getActiveTimers();
  return currentTimers.filter(timer => timer.name == identifier);
};

const getSelectedChild = async (name) => {
  const response = await babyBuddy.getChildren();
  const children = response.results;

  if (name) {
    return children.find(child => child.first_name.toLowerCase().includes(name));
  } else if (children.length === 1) {
    return children[0];
  } else {
    return undefined;
  }
};

const getResolvedSlotValue = (requestEnvelope, slotName) => {
  const slot = Alexa.getSlot(requestEnvelope, slotName);
  const resolutions = slot.resolutions.resolutionsPerAuthority;
  const resolution = resolutions.find(x => x !== undefined);

  if (resolution.status.code === 'ER_SUCCESS_MATCH') {
    const value = resolution.values.find(x => x !== undefined);
    return value.value.name;
  } else {
    return undefined;
  }
};

const getMinutesFromDurationString = (durationString) => {
  const [hourString, minuteString, secondString] = durationString.split(':');
  const minutes = parseInt(hourString) * 60 + parseInt(minuteString) + (parseFloat(secondString) >= 0 ? 1 : 0);
  return minutes;
}

module.exports = {
  TIMER_TYPES,
  getTimersForIdentifier,
  getSelectedChild,
  getResolvedSlotValue,
  getMinutesFromDurationString
};