const { AlbumPayloadSchema } = require('../../api/albums/schema');
const InvariantError = require('../../exceptions/InvariantError');

const AlbumsValidator = {
  validateAlbumPayload: (payload) => {
    const validationResult = AlbumPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = AlbumsValidator;
