const axios = require('axios').default;
const AWS = require('aws-sdk');

const region = "us-east-2";

const secretsClient = new AWS.SecretsManager({
  region: region
});

const fetchSecrets = async () => {
  return new Promise((resolve, reject) => {
    // const secretName = "baby-buddy-alexa-skill";

    // secretsClient.getSecretValue({ SecretId: secretName }, (err, data) => {
    //   if (err) {
    //     reject(err);
    //   } else {
    //     if ('SecretString' in data) {
    //       const secret = data.SecretString;
    //       const parsed = JSON.parse(secret);
    //       resolve(parsed);
    //     } else {
    //       const buff = new Buffer(data.SecretBinary, 'base64');
    //       const decodedBinarySecret = buff.toString('ascii');
    //       resolve(decodedBinarySecret);
    //     }
    //   }
    // });
    resolve({
      BABY_BUDDY_API_KEY: process.env.BABY_BUDDY_API_KEY,
      BABY_BUDDY_API_URL: process.env.BABY_BUDDY_API_URL
    });
  });
};

const URLS = {
  CHILDREN: 'api/children/',
  DIAPER_CHANGES: 'api/changes/',
  FEEDINGS: 'api/feedings/',
  NOTES: 'api/notes/',
  SLEEP: 'api/sleep/',
  TEMPERATURE: 'api/temperature/',
  TIMERS: 'api/timers/',
  TUMMY_TIMES: 'api/tummy-times/',
  WEIGHT: 'api/weight/'
};

class BabyBuddyApi {

  async getRequest(url) {
    const { BABY_BUDDY_API_KEY, BABY_BUDDY_API_URL } = await fetchSecrets();

    try {
      const response = await axios.get(url, {
        baseURL: BABY_BUDDY_API_URL,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${BABY_BUDDY_API_KEY}`
        }
      });
      console.log(`getRequest(${url}), response: ${JSON.stringify(response.data)}`);
      return response.data;
    } catch (err) {
      console.log(`Error: getRequest(${url}), error: ${JSON.stringify(err)}`);
      throw err;
    }
  }

  async postRequest(url, body) {
    const { BABY_BUDDY_API_KEY, BABY_BUDDY_API_URL } = await fetchSecrets();

    try {
      const response = await axios.post(url, body, {
        baseURL: BABY_BUDDY_API_URL,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${BABY_BUDDY_API_KEY}`
        }
      });
      console.log(`postRequest(${url}, ${JSON.stringify(body)}), response: ${JSON.stringify(response.data)}`);
      return response.data;
    } catch (err) {
      console.log(`Error: postRequest(${url}, ${JSON.stringify(body)}), error: ${JSON.stringify(err)}`);
      throw err;
    }
  }

  async deleteRequest(url) {
    const { BABY_BUDDY_API_KEY, BABY_BUDDY_API_URL } = await fetchSecrets();

    try {
      const response = await axios.delete(url, {
        baseURL: BABY_BUDDY_API_URL,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${BABY_BUDDY_API_KEY}`
        }
      });
      console.log(`deleteRequest(${url}), response: ${JSON.stringify(response.data)}`);
      return response.data;
    } catch (err) {
      console.log(`Error: deleteRequest(${url}), error: ${JSON.stringify(err)}`);
      throw err;
    }
  }

  async getTimers() {
    return await this.getRequest(URLS.TIMERS);
  };

  async getActiveTimers() {
    const response = await this.getTimers();
    return response.results.filter(timer => timer.active && timer.name);
  }

  async startTimer(name, child) {
    const body = {
      child,
      name,
      user: null
    };

    return await this.postRequest(URLS.TIMERS, body);
  };

  async destroyTimer(id) {
    return await this.deleteRequest(`${URLS.TIMERS}${id}/`);
  }

  async getChildren() {
    return await this.getRequest(URLS.CHILDREN);
  };

  async getFeedings(child) {
    return await this.getRequest(`${URLS.FEEDINGS}?child=${child}`);
  }

  async getLastFeeding(child) {
    const feedings = await this.getRequest(`${URLS.FEEDINGS}?child=${child}&limit=1`);
    const lastFeeding = feedings.results.find(x => x !== undefined);
    return lastFeeding;
  }

  async createFeeding(child, timer, type, method, amount) {
    const body = {
      child,
      type,
      method,
      amount,
      timer
    };

    return await this.postRequest(URLS.FEEDINGS, body);
  };

  async createSleep(child, timer) {
    const body = {
      child,
      timer
    };

    return await this.postRequest(URLS.SLEEP, body);
  };

  async createDiaperChange(child, wet, solid, color, amount) {
    const body = {
      child,
      wet,
      solid,
      color,
      amount,
      time: new Date().toISOString()
    };

    return await this.postRequest(URLS.DIAPER_CHANGES, body);
  };

  async createTummyTime(child, timer) {
    const body = {
      child,
      timer
    };

    return await this.postRequest(URLS.TUMMY_TIMES, body);
  };

};

module.exports = new BabyBuddyApi();
