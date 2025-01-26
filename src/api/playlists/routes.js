const routes = (handler) => [
  {
    method: 'POST',
    path: '/playlists',
    handler: (request, h) => handler.postPlaylistHandler(request, h),
    options: {
      auth: 'openmusic_jwt',
    },
  },
  {
    method: 'GET',
    path: '/playlists',
    handler: (request) => handler.getPlaylistsHandler(request),
    options: {
      auth: 'openmusic_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/playlists/{id}',
    handler: (request) => handler.deletePlaylistByIdHandler(request),
    options: {
      auth: 'openmusic_jwt',
    },
  },
  {
    method: 'POST',
    path: '/playlists/{id}/songs',
    handler: (request, h) => handler.postPlaylistSongHandler(request, h),
    options: {
      auth: 'openmusic_jwt',
    },
  },
  {
    method: 'GET',
    path: '/playlists/{id}/songs',
    handler: (request) => handler.getPlaylistSongsHandler(request),
    options: {
      auth: 'openmusic_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/playlists/{id}/songs',
    handler: (request) => handler.deletePlaylistSongByIdHandler(request),
    options: {
      auth: 'openmusic_jwt',
    },
  },
  {
    method: 'GET',
    path: '/playlists/{id}/activities',
    handler: (request) => handler.getPlaylistActivitiesHandler(request),
    options: {
      auth: 'openmusic_jwt',
    },
  },
];

module.exports = routes;
