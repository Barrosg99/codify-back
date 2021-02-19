require('dotenv').config();
const redis = require('promise-redis')();
const jwt = require('jsonwebtoken');

class Redis {
  constructor() {
    this.client = null;
  }

  static createInstance() {
    const clientCreate = redis.createClient({
      url: process.env.REDISCLOUD_URL,
    });

    clientCreate.on('error', (error) => {
      console.error(error);
    });
    return clientCreate;
  }

  static getInstance() {
    if (!this.client) this.client = this.createInstance();
    return this.client;
  }

  static async setSession(payload) {
    const clientInstance = this.getInstance();
    const key = jwt.sign(payload, process.env.SECRET);

    await clientInstance.set(key, JSON.stringify(payload), 'EX', process.env.SESSION_EXPIRATION);

    return key;
  }

  static async getSession(key) {
    const clientInstance = this.getInstance();
    const result = await clientInstance.get(key);
    if (result) return JSON.parse(result);
    return false;
  }

  static deleteSession(key) {
    const clientInstance = this.getInstance();
    return clientInstance.del(key);
  }

  static async close() {
    const clientInstance = this.getInstance();
    await clientInstance.quit();
  }
}

module.exports = Redis;
