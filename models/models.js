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
  thumbnail: {
    url: String,
    width: Number,
    height: Number
  }
});
models.video = mongoose.model("Video", videoSchema);
module.exports = models;
