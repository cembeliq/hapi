const InvariantError = require('../../exceptions/InvariantError');

const ALLOWED_MIME_TYPES = [
  'image/apng',
  'image/avif',
  'image/gif',
  'image/jpeg',
  'image/png',
  'image/webp',
];

const MAX_FILE_SIZE = 512000; // 512KB

const UploadsValidator = {
  validateImageHeaders: (headers) => {
    const { 'content-type': contentType, 'content-length': contentLength } = headers;

    if (!ALLOWED_MIME_TYPES.includes(contentType)) {
      throw new InvariantError('Tipe file harus berupa gambar');
    }

    if (parseInt(contentLength, 10) > MAX_FILE_SIZE) {
      throw new InvariantError('Ukuran file terlalu besar (max 512KB)');
    }
  },
};

module.exports = UploadsValidator;
