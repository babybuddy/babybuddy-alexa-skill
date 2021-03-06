import axios from 'axios';

import {
  GetResponse,
  CreateFeeding,
  Feeding,
  Timer,
  Child,
  CreateDiaperChange,
  Secret,
  URLS,
} from './types';

const fetchSecrets: () => Promise<Secret> = async () => {
  return new Promise((resolve, reject) => {
    if (process.env.BABY_BUDDY_API_KEY && process.env.BABY_BUDDY_API_URL) {
      resolve({
        apiKey: process.env.BABY_BUDDY_API_KEY,
        apiUrl: process.env.BABY_BUDDY_API_URL,
      });
    } else {
      reject('BABY_BUDDY_API_KEY and/or BABY_BUDDY_API_URL not defined!');
    }
  });
};

class BabyBuddyApi {
  async getRequest<T>(url: string): Promise<GetResponse<T>> {
    const { apiKey, apiUrl } = await fetchSecrets();

    try {
      const response = await axios.get(url, {
        baseURL: apiUrl,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${apiKey}`,
        },
      });
      console.log(
        `getRequest(${url}), response: ${JSON.stringify(response.data)}`
      );
      return response.data;
    } catch (err) {
      console.log(`Error: getRequest(${url}), error: ${JSON.stringify(err)}`);
      throw err;
    }
  }

  async postRequest(url: string, body: any) {
    const { apiKey, apiUrl } = await fetchSecrets();

    try {
      const response = await axios.post(url, body, {
        baseURL: apiUrl,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${apiKey}`,
        },
      });
      console.log(
        `postRequest(${url}, ${JSON.stringify(
          body
        )}), response: ${JSON.stringify(response.data)}`
      );
      return response.data;
    } catch (err) {
      console.log(
        `Error: postRequest(${url}, ${JSON.stringify(
          body
        )}), error: ${JSON.stringify(err)}`
      );
      throw err;
    }
  }

  async deleteRequest(url: string) {
    const { apiKey, apiUrl } = await fetchSecrets();

    try {
      const response = await axios.delete(url, {
        baseURL: apiUrl,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${apiKey}`,
        },
      });
      console.log(
        `deleteRequest(${url}), response: ${JSON.stringify(response.data)}`
      );
      return response.data;
    } catch (err) {
      console.log(
        `Error: deleteRequest(${url}), error: ${JSON.stringify(err)}`
      );
      throw err;
    }
  }

  async getTimers(): Promise<GetResponse<Timer>> {
    return await this.getRequest(URLS.TIMERS);
  }

  async getActiveTimers(): Promise<Array<Timer>> {
    const response = await this.getTimers();
    const allTimers = response.results as Array<Timer>;
    return allTimers.filter(timer => timer.active && timer.name);
  }

  async startTimer(name: string, childId: string) {
    const body = {
      child: childId,
      name,
      user: null,
    };

    return await this.postRequest(URLS.TIMERS, body);
  }

  async destroyTimer(id: string) {
    return await this.deleteRequest(`${URLS.TIMERS}${id}/`);
  }

  async getChildren(): Promise<GetResponse<Child>> {
    return await this.getRequest(URLS.CHILDREN);
  }

  async getFeedings(childId: string): Promise<GetResponse<Feeding>> {
    return await this.getRequest(`${URLS.FEEDINGS}?child=${childId}`);
  }

  async getLastFeeding(childId: string): Promise<Feeding | undefined> {
    const feedings: GetResponse<Feeding> = await this.getRequest(
      `${URLS.FEEDINGS}?child=${childId}&limit=1`
    );
    const lastFeeding = feedings.results.find(x => x !== undefined);
    return lastFeeding;
  }

  async createFeeding(feeding: CreateFeeding) {
    return await this.postRequest(URLS.FEEDINGS, feeding);
  }

  async createSleep(childId: string, timerId: string) {
    const body = {
      child: childId,
      timer: timerId,
    };

    return await this.postRequest(URLS.SLEEP, body);
  }

  async createDiaperChange(diaperChange: CreateDiaperChange) {
    const body = {
      ...diaperChange,
      time: new Date().toISOString(),
    };

    return await this.postRequest(URLS.DIAPER_CHANGES, body);
  }

  async createTummyTime(childId, timerId) {
    const body = {
      child: childId,
      timer: timerId,
    };

    return await this.postRequest(URLS.TUMMY_TIMES, body);
  }
}

const babyBuddy = new BabyBuddyApi();

export {
  babyBuddy
};
