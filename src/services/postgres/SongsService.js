const { nanoid } = require('nanoid');
const PostgresService = require('./PostgresService');
const NotFoundError = require('../../exceptions/NotFoundError');

class SongsService {
  constructor(cacheService) {
    this._pool = new PostgresService();
    this._cacheService = cacheService;
  }

  async addSong({
    title, year, genre, performer, duration, albumId,
  }) {
    const id = `song-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO songs(id, title, year, genre, performer, duration, album_id) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, year, genre, performer, duration, albumId],
    };

    const result = await this._pool.query(query);
    await this._cacheService.delete('songs:all');
    return result.rows[0].id;
  }

  async getSongs(title = '', performer = '') {
    const cacheKey = `songs:${title}:${performer}`;
    try {
      const result = await this._cacheService.get(cacheKey);
      const songs = JSON.parse(result);
      return {
        songs,
        source: 'cache',
      };
    } catch (error) {
      const query = {
        text: 'SELECT id, title, performer FROM songs WHERE LOWER(title) LIKE LOWER($1) AND LOWER(performer) LIKE LOWER($2)',
        values: [`%${title}%`, `%${performer}%`],
      };

      const result = await this._pool.query(query);
      await this._cacheService.set(cacheKey, JSON.stringify(result.rows));
      return {
        songs: result.rows,
        source: 'database',
      };
    }
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }

    return result.rows[0];
  }

  async editSongById(id, {
    title, year, genre, performer, duration, albumId,
  }) {
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, album_id = $6 WHERE id = $7 RETURNING id',
      values: [title, year, genre, performer, duration, albumId, id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui lagu. Id tidak ditemukan');
    }
    await this._cacheService.delete('songs:all');
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Gagal menghapus lagu. Id tidak ditemukan');
    }
    await this._cacheService.delete('songs:all');
  }
}

module.exports = SongsService;
