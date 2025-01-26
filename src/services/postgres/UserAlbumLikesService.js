const { nanoid } = require('nanoid');
const PostgresService = require('./PostgresService');
const NotFoundError = require('../../exceptions/NotFoundError');
const InvariantError = require('../../exceptions/InvariantError');

class UserAlbumLikesService {
  constructor(cacheService) {
    this._pool = new PostgresService();
    this._cacheService = cacheService;
  }

  async addLike(userId, albumId) {
    // Check if album exists
    const checkAlbumQuery = {
      text: 'SELECT id FROM albums WHERE id = $1',
      values: [albumId],
    };
    const albumResult = await this._pool.query(checkAlbumQuery);
    if (!albumResult.rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    // Check if user already liked the album
    const checkLikeQuery = {
      text: 'SELECT id FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };
    const likeResult = await this._pool.query(checkLikeQuery);
    if (likeResult.rows.length > 0) {
      throw new InvariantError('Anda sudah menyukai album ini');
    }

    // Add like
    const id = `like-${nanoid(16)}`;
    const addLikeQuery = {
      text: 'INSERT INTO user_album_likes(id, user_id, album_id) VALUES($1, $2, $3) RETURNING id',
      values: [id, userId, albumId],
    };
    await this._pool.query(addLikeQuery);

    // Delete cache
    await this._cacheService.delete(`likes:${albumId}`);
  }

  async deleteLike(userId, albumId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Like tidak ditemukan');
    }

    // Delete cache
    await this._cacheService.delete(`likes:${albumId}`);
  }

  async getLikeCount(albumId) {
    try {
      // Get from cache first
      const result = await this._cacheService.get(`likes:${albumId}`);
      return {
        likes: parseInt(result, 10),
        source: 'cache',
      };
    } catch (error) {
      // If cache miss, get from database
      const query = {
        text: 'SELECT COUNT(*) as like_count FROM user_album_likes WHERE album_id = $1',
        values: [albumId],
      };

      const result = await this._pool.query(query);
      const likes = parseInt(result.rows[0].like_count, 10);

      // Store to cache
      await this._cacheService.set(`likes:${albumId}`, likes);

      return {
        likes,
        source: 'database',
      };
    }
  }
}

module.exports = UserAlbumLikesService;
