const redis = require('redis');
const config = require('../../config');

class CacheService {
  constructor() {
    this._client = redis.createClient({
      url: `redis://${config.redis.server}`,
    });

    this._client.on('error', (error) => {
      console.error('Redis Client Error:', error);
    });

    this._client.connect();
  }

  async set(key, value, expirationInSeconds = 1800) {
    await this._client.set(key, value, {
      EX: expirationInSeconds,
    });
  }

  async get(key) {
    const result = await this._client.get(key);
    if (result === null) throw new Error('Cache tidak ditemukan');
    return result;
  }

  async delete(key) {
    return this._client.del(key);
  }
}

module.exports = CacheService;
