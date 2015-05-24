// Main page.

var path = require('path');
var models = require('../models/models');
var Playlist = models.playlist;
var YouTube = require("youtube-api");
YouTube.authenticate({
  type: "key",
  key: process.env.KIOSK_GOOGLEAPI
});

api = {};

var parseresults = function(playlistres) {
  // NOTE: thumbnailsizes = ['default', 'medium', 'high'];
  thumbnailSize = 'medium';

  var plitems = playlistres;
  var newVideos = [];
  for (var i = plitems.length - 1; i >= 0; i--) {
    var vidobj = {};
    var this_vid = plitems[i];
    vidobj.name = this_vid.snippet.title;
    vidobj.description = this_vid.snippet.description;
    vidobj.videoId = this_vid.snippet.resourceId.videoId;
    vidobj.ID = this_vid.id;
    vidobj.thumbnail = this_vid.snippet.thumbnails[thumbnailSize];
    newVideos.push(vidobj);
  }
  return newVideos;
};

var getplaylistItems = function(id, errs, page, callback) {
  YouTube.playlistItems.list({
    part: "id,snippet",
    playlistId: id,
    maxResults: 3,
    pageToken: page,
  }, function(api_err, newplaylistdata) {
    var nextpage = null;
    if (api_err) {
      errs.push({
        'error': 'api_error',
        'info': api_err
      });
    } else {
      nextpage = newplaylistdata.nextPageToken;
    }
    callback(nextpage, errs, newplaylistdata);
  });
};

api.videos = function(req, res) {
  // Function definitions //

  var updatedbplaylist = function(playlistId, videoArray) {
    Playlist
      .findOneAndUpdate({
        playlistId: playlistId
      }, {
        videos: videoArray
      })
      .exec(function(err, update) {
        if (err) {
          console.log('ERROR UPDATING DATABASE: ', err);
          res.send({
            failed: true
          });
        } else {
          res.send({
            failed: false
          });
        }
      });
  };
  var loopthroughplaylist = function(id, errs, results, page) {
    if (page === -1) {
      page = (function() {
        return;
      })();
    }
    getplaylistItems(id, errs, page, function(page, errs, output) {
      if (errs.length > 0) {
        console.log('YOUTUBE PLAYLIST API ERRORS:', errs.length);
        console.log(errs);
        return;
      } else {
        results.push.apply(results, output.items);
      }
      if (page === undefined) {
        // We are out of pages. This playlist has been completely found.
        dbVideos = parseresults(results);
        updatedbplaylist(id, dbVideos);
        return;
      } else {
        loopthroughplaylist(id, errs, results, page);
      }
    });
  };

  // Process //

  var errs = [];
  // Get playlists from database
  Playlist
    .find({})
    .select('playlistId')
    .exec(function(dberr, playlists) {
      if (dberr) {
        errs.push({
          'error': 'db_error',
          'info': dberr
        });
      }
      if (playlists.length > 0) {
        for (var i = playlists.length - 1; i >= 0; i--) {
          // Get updated playlist from YouTube
          loopthroughplaylist(playlists[i].playlistId, [], [], -1);
        }
      } else {
        res.send({
          failed: true,
          info: 'No playlists'
        });
      }
    });

  // YouTube API call to get all videos from playlists

  // Update database with new videos

  // Send confirmation of update
};

api.playlists = function(req, res) {
  Playlist
    .find({})
    .exec(function(err, playlists) {
      res.send(playlists);
    });
};

api.makedb = function(req, res) {
  ocoplist = {
    "name": "OCO",
    "description": "Olin Conductorless Orchestra",
    "playlistId": "PLth5yjJPR2km1BVZL8pC5udHHiDyKuDxx",
    "videos": []
  };

  OCO = new Playlist(ocoplist);
  OCO.save(function(err, saved) {
    console.log(err || saved);
    Playlist
      .find({})
      .exec(function(err, playlists) {
        res.send(err || playlists);
      });
  });
};

module.exports = api;
