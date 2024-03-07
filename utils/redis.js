const redis = require('redis');
const { promisify } = require('util');


class RedisClient {
  constructor() {
    this.client = redis.createClient();

    this.client.on('error', (err) => {
      console.error('Redis Error:', err);
    })
  }

  isAlive() {
    return this.client.connected();
  }

  async get(key) {
    const getKey = promisify(this.client.get).bind(this.client);

    return getKey(key);
  }

  async set(key, value, duration) {
    return new Promise((resolve, reject) => {
      this.client.set(key, value, 'EX', duration, (err, reply) => {
        if (err) {
          reject(err);
        } else {
          resolve(reply);
        }
      });
    });
  }

  async del(key) {
    return new Promise((resolve, reject) => {
      this.client.del(key, (err, reply) => {
        if (err) {
          reject(err);
        } else {
          resolve(reply);
        }
      });
    });
  }
}

const redisClient = new RedisClient();
module.exports(redisClient);
