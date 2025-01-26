class Listener {
  constructor(playlistsService, mailSender) {
    this._playlistsService = playlistsService;
    this._mailSender = mailSender;

    this.listen = this.listen.bind(this);
  }

  async listen(message) {
    try {
      const { playlistId, targetEmail } = JSON.parse(message.content.toString());

      const playlistWithSongs = await this._playlistsService.getSongsFromPlaylist(playlistId);

      const data = {
        playlist: {
          id: playlistWithSongs.id,
          name: playlistWithSongs.name,
          songs: playlistWithSongs.songs.map((song) => ({
            id: song.id,
            title: song.title,
            performer: song.performer,
          })),
        },
      };

      const result = await this._mailSender.sendEmail(targetEmail, JSON.stringify(data));
      console.log(result);
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = Listener;
