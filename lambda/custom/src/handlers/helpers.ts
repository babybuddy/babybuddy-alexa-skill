import { Timer, Child, babyBuddy } from "../babybuddy";

enum TimerTypes {
  FEEDING = "feeding",
  SLEEPING = "sleeping",
  TUMMY_TIME = "tummy time",
}

const getTimersForIdentifier: (identifier: string) => Promise<Timer[]> = async (
  identifier: string
) => {
  const currentTimers = await babyBuddy.getActiveTimers();
  return currentTimers.filter((timer) => timer.name === identifier);
};

const getSelectedChild: (name: string) => Promise<Child | undefined> = async (
  name: string
) => {
  const response = await babyBuddy.getChildren();
  const children = response.results;

  if (name) {
    return children.find((child) =>
      child.first_name.toLowerCase().includes(name.toLowerCase())
    );
  } else if (children.length === 1) {
    return children[0];
  } else {
    return undefined;
  }
};

const getMinutesFromDurationString: (duration: string) => number = (
  duration: string
) => {
  const [hourString, minuteString, secondString] = duration.split(":");
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
  getMinutesFromDurationString,
};
