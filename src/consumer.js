require('dotenv').config();
const amqp = require('amqplib');
const config = require('./config');
const PlaylistsService = require('./services/postgres/PlaylistsService');
const MailSender = require('./services/mail/MailSender');
const Listener = require('./listener');

const init = async () => {
  const playlistsService = new PlaylistsService();
  const mailSender = new MailSender();
  const listener = new Listener(playlistsService, mailSender);

  const connection = await amqp.connect(config.rabbitmq.url);
  const channel = await connection.createChannel();

  await channel.assertQueue('export:playlists', {
    durable: true,
  });

  channel.consume('export:playlists', listener.listen, { noAck: true });
};

init();
