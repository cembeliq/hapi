class AlbumsHandler {
  constructor(service, validator, storageService, uploadsValidator, userAlbumLikesService) {
    this._service = service;
    this._validator = validator;
    this._storageService = storageService;
    this._uploadsValidator = uploadsValidator;
    this._userAlbumLikesService = userAlbumLikesService;

    this.postAlbumHandler = this.postAlbumHandler.bind(this);
    this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
    this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this);
    this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this);
    this.postAlbumCoverHandler = this.postAlbumCoverHandler.bind(this);
    this.postAlbumLikeHandler = this.postAlbumLikeHandler.bind(this);
    this.deleteAlbumLikeHandler = this.deleteAlbumLikeHandler.bind(this);
    this.getAlbumLikesHandler = this.getAlbumLikesHandler.bind(this);
  }

  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { name, year } = request.payload;
    const albumId = await this._service.addAlbum({ name, year });

    const response = h.response({
      status: 'success',
      data: {
        albumId,
      },
    });
    response.code(201);
    return response;
  }

  async getAlbumByIdHandler(request, h) {
    const { id } = request.params;
    const album = await this._service.getAlbumById(id);

    const response = h.response({
      status: 'success',
      data: {
        album,
      },
    });
    response.code(200);
    return response;
  }

  async putAlbumByIdHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { id } = request.params;
    const { name, year } = request.payload;
    await this._service.editAlbumById(id, { name, year });

    const response = h.response({
      status: 'success',
      message: 'Album updated successfully',
    });
    response.code(200);
    return response;
  }

  async deleteAlbumByIdHandler(request, h) {
    const { id } = request.params;
    await this._service.deleteAlbumById(id);

    const response = h.response({
      status: 'success',
      message: 'Album deleted successfully',
    });
    response.code(200);
    return response;
  }

  async postAlbumCoverHandler(request, h) {
    const { id } = request.params;
    const { cover } = request.payload;

    if (!cover) {
      throw new Error('No cover file provided');
    }

    if (!cover.hapi) {
      throw new Error('Invalid file upload');
    }

    this._uploadsValidator.validateImageHeaders(cover.hapi.headers);

    const cover_url = await this._storageService.writeFile(cover, cover.hapi);

    const oldCover = await this._service.editAlbumCover(id, cover_url);

    if (oldCover) {
      await this._storageService.deleteFile(oldCover);
    }

    const response = h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
    });
    response.code(201);
    return response;
  }

  async postAlbumLikeHandler(request, h) {
    const { id: albumId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._userAlbumLikesService.addLike(credentialId, albumId);

    const response = h.response({
      status: 'success',
      message: 'Berhasil menyukai album',
    });
    response.code(201);
    return response;
  }

  async deleteAlbumLikeHandler(request) {
    const { id: albumId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._userAlbumLikesService.deleteLike(credentialId, albumId);

    return {
      status: 'success',
      message: 'Berhasil membatalkan like album',
    };
  }

  async getAlbumLikesHandler(request, h) {
    const { id: albumId } = request.params;
    const { likes, source } = await this._userAlbumLikesService.getLikeCount(albumId);

    const response = h.response({
      status: 'success',
      data: {
        likes,
      },
    });

    response.header('X-Data-Source', source);
    return response;
  }
}

module.exports = AlbumsHandler;
