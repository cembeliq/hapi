const config = {
  app: {
    host: process.env.HOST,
    port: process.env.PORT,
  },
  postgres: {
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    port: process.env.PGPORT,
  },
  rabbitmq: {
    url: process.env.RABBITMQ_SERVER,
  },
  redis: {
    server: process.env.REDIS_SERVER,
  },
};

module.exports = config;
