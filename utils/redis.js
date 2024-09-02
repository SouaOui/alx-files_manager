const redis = require('redis');
const { promisify } = require('util');

class RedisClient {
  constructor() {
    this.client = redis.createClient();
    this.isClientConnected = true;

    this.getAsync = promisify(this.client.get).bind(this);

    this.client.on('error', (err) => {
      console.error('Redis client failed to connect:', err.message || err.toString());
      this.isClientConnected = false;
    });
    this.client.on('connect', () => {
      this.isClientConnected = true;
    });
  }

  isAlive() {
    return this.isClientConnected;
  }

  async get(key) {
    return promisify(this.client.GET).bind(this.client)(key);
  }

  async set(key, value, expiry) {
    await this.client.setex(key, expiry, value);
  }

  async del(key) {
    try {
      const result = await this.client.delAsync(key);
      return result === 1;
    } catch (err) {
      console.error(`Error deleting key ${key}:`, err);
      return false;
    }
  }
}

const redisClient = new RedisClient();

module.exports = redisClient;
