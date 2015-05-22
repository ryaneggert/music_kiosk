var auths = require("./routes/auths");
var main = require("./routes/index");
var express = require("express");
var session = require("express-session");
var path = require("path");
var logger = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

var CookieParser = cookieParser('secret');
var sessionStore = new session.MemoryStore();


var app = express();

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(CookieParser);
app.use(express.static(path.join(__dirname, "public")));
app.use(session({
  secret: 'secret',
  resave: false,
  store: sessionStore,
  saveUninitialized: true
}));

app.use('/auth', auths);

// app.get('/api/home', auths.isAuth_api, home.home);

app.get('/*', main.main);

mongoose.connect(process.env.MONGOURI || 'mongodb://localhost/bingo');
var PORT = 3000;

app = app.listen(process.env.PORT || PORT);
