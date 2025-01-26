const amqp = require('amqplib');
const config = require('../../config');

class ProducerService {
  constructor() {
    this._connection = null;
    this._channel = null;
  }

  async init() {
    this._connection = await amqp.connect(config.rabbitmq.url);
    this._channel = await this._connection.createChannel();
  }

  async sendMessage(queue, message) {
    if (!this._channel) {
      await this.init();
    }

    await this._channel.assertQueue(queue, {
      durable: true,
    });

    await this._channel.sendToQueue(queue, Buffer.from(message));

    // Close connection after 1 second
    setTimeout(async () => {
      await this.close();
    }, 1000);
  }

  async close() {
    try {
      await this._channel?.close();
      await this._connection?.close();
    } finally {
      this._channel = null;
      this._connection = null;
    }
  }
}

module.exports = ProducerService;
