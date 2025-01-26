const { nanoid } = require('nanoid');
const PostgresService = require('./PostgresService');
const NotFoundError = require('../../exceptions/NotFoundError');
const config = require('../../config');

class AlbumsService {
  constructor() {
    this._pool = new PostgresService();
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO albums(id, name, year) VALUES($1, $2, $3) RETURNING *',
      values: [id, name, year],
    };

    const result = await this._pool.query(query);
    return result.rows[0].id;
  }

  async getAlbumById(id) {
    const query = {
      text: `SELECT 
              a.*,
              json_agg(
                json_build_object(
                  'id', s.id,
                  'title', s.title,
                  'performer', s.performer
                )
              ) FILTER (WHERE s.id IS NOT NULL) as songs
            FROM albums a
            LEFT JOIN songs s ON s.album_id = a.id
            WHERE a.id = $1
            GROUP BY a.id`,
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    const album = result.rows[0];
    return {
      id: album.id,
      name: album.name,
      year: album.year,
      coverUrl: album.cover_url ? `http://${config.app.host}:${config.app.port}/uploads/covers/${album.cover_url}` : null,
      songs: album.songs || [],
    };
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
    }
  }

  async editAlbumCover(id, cover_url) {
    // First, get the current cover_url
    const getQuery = {
      text: 'SELECT cover_url FROM albums WHERE id = $1',
      values: [id],
    };

    const getResult = await this._pool.query(getQuery);

    if (!getResult.rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    const oldCover = getResult.rows[0].cover_url;

    // Then update with new cover_url
    const updateQuery = {
      text: 'UPDATE albums SET cover_url = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id',
      values: [cover_url, id],
    };

    await this._pool.query(updateQuery);

    return oldCover;
  }
}

module.exports = AlbumsService;
