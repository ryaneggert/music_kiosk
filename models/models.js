var mongoose = require("mongoose");
var supergoose = require("supergoose");
var models = {};

var userSchema = mongoose.Schema({
  name: String,
  guest: Boolean,
  // image:String,
});

userSchema.plugin(supergoose); // allows .findOrCreate()
// https://github.com/jamplify/supergoose

var playlistSchema = mongoose.Schema({
  name: String,
  description: String,
  playlistId: String,
  videos: [{
    name: String,
    description: String,
    videoId: String,
    ID: String,
    thumbnail: {
      url: String,
      width: Number,
      height: Number
    }
  }]
});

models.playlist = mongoose.model("Playlist", playlistSchema);

var videoSchema = mongoose.Schema({
  name: String,
  description: String,
  videoId: String,
  ID: String,
  // type: String,
  thumbnail: {
    url: String,
    width: Number,
    height: Number
  }
});
models.video = mongoose.model("Video", videoSchema);

var songSchema = mongoose.Schema({
  title: String,
  comments: String,
  writeup: String,
  composer: String,
  artist: String,
  album: String,
  rec_date: String,
  duration: String,
  sample_rate: String,
  type: String,

  sc_account: String,
  sc_id: Number,
  secret_token: String,
  secret_uri: String

});
models.song = mongoose.model("Song", songSchema);

module.exports = models;
