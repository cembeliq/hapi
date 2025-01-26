const { Pool } = require('pg');
const config = require('../../config');

class PostgresService {
  constructor() {
    this._pool = new Pool(config.postgres);
  }

  async query(query) {
    const { text, values = [] } = query;
    const result = await this._pool.query(text, values);
    return result;
  }
}

module.exports = PostgresService;
