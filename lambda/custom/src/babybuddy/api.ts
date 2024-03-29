import axios from "axios";

import {
  GetResponse,
  CreateFeeding,
  Feeding,
  Timer,
  Child,
  CreateDiaperChange,
  Secret,
  URLS,
  CreateTummyTime,
  CreateSleep,
  DiaperChange,
  Sleep,
} from "./types";

const fetchSecrets: () => Promise<Secret> = async () => {
  return new Promise((resolve, reject) => {
    if (process.env.BABY_BUDDY_API_KEY && process.env.BABY_BUDDY_API_URL) {
      const secrets: Secret = {
        apiKey: process.env.BABY_BUDDY_API_KEY,
        apiUrl: process.env.BABY_BUDDY_API_URL,
      };

      if (
        process.env.CF_ACCESS_CLIENT_ID &&
        process.env.CF_ACCESS_CLIENT_SECRET
      ) {
        secrets.cloudflare = {
          cfAccessClientId: process.env.CF_ACCESS_CLIENT_ID,
          cfAccessClientSecret: process.env.CF_ACCESS_CLIENT_SECRET,
        };
      }
      resolve(secrets);
    } else {
      reject("BABY_BUDDY_API_KEY and/or BABY_BUDDY_API_URL not defined!");
    }
  });
};

const buildHeaders: (
  secrets: Secret
) => Promise<{ [headerName: string]: string }> = async (secrets) => {
  return new Promise((resolve) => {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Token ${secrets.apiKey}`,
    };

    if (secrets.cloudflare) {
      headers["CF-Access-Client-Id"] = `${secrets.cloudflare.cfAccessClientId}`;
      headers[
        "CF-Access-Client-Secret"
      ] = `${secrets.cloudflare.cfAccessClientSecret}`;
    }

    resolve(headers);
  });
};

class BabyBuddyApi {
  async getRequest<T>(url: string): Promise<GetResponse<T>> {
    const secrets = await fetchSecrets();

    try {
      const response = await axios.get(url, {
        baseURL: secrets.apiUrl,
        headers: await buildHeaders(secrets),
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

  async postRequest(url: string, body) {
    const secrets = await fetchSecrets();

    try {
      const response = await axios.post(url, body, {
        baseURL: secrets.apiUrl,
        headers: await buildHeaders(secrets),
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
    const secrets = await fetchSecrets();

    try {
      const response = await axios.delete(url, {
        baseURL: secrets.apiUrl,
        headers: await buildHeaders(secrets),
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
    return allTimers.filter((timer) => timer.active && timer.name);
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
    const lastFeeding = feedings.results.find((x) => x !== undefined);
    return lastFeeding;
  }

  async createFeeding(feeding: CreateFeeding) {
    return await this.postRequest(URLS.FEEDINGS, feeding);
  }

  async createSleep(sleep: CreateSleep) {
    return await this.postRequest(URLS.SLEEP, sleep);
  }

  async createDiaperChange(diaperChange: CreateDiaperChange) {
    const body = {
      ...diaperChange,
      time: new Date().toISOString(),
    };

    return await this.postRequest(URLS.DIAPER_CHANGES, body);
  }

  async getDiaperChanges(
    childId: string,
    start_time: string,
    end_time: string
  ): Promise<GetResponse<DiaperChange>> {
    return await this.getRequest(
      `${URLS.DIAPER_CHANGES}?child=${childId}&date_min=${start_time}&date_max=${end_time}`
    );
  }

  async getLastDiaperChange(
    childId: string,
    wet: boolean | null,
    solid: boolean | null
  ): Promise<DiaperChange | null> {
    let url = `${URLS.DIAPER_CHANGES}?child=${childId}&limit=1`;

    if (wet !== null) {
      url = url.concat(`&wet=${wet}`);
    }

    if (solid !== null) {
      url = url.concat(`&solid=${solid}`);
    }

    const diaperChange: GetResponse<DiaperChange> = await this.getRequest(url);

    if (diaperChange.count === 0) {
      return null;
    }

    return diaperChange.results[0];
  }

  async getLastSleep(childId: string): Promise<Sleep | null> {
    const sleeps: GetResponse<Sleep> = await this.getRequest(
      `${URLS.SLEEP}?child=${childId}&limit=1`
    );

    if (sleeps.count === 0) {
      return null;
    }

    return sleeps.results[0];
  }

  async createTummyTime(tummyTime: CreateTummyTime) {
    return await this.postRequest(URLS.TUMMY_TIMES, tummyTime);
  }
}

const babyBuddy = new BabyBuddyApi();

export { babyBuddy };
