require('dotenv').config();
var dburl = process.env.mongodb
var port = process.env.PORT;

var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var strategy = require('passport-local').Strategy;
var routes = require('./routes/index');
var User = require('./models/models').User;

init();
main();

function init() {
  // DB Connection
  mongoose.Promise = global.Promise;
  mongoose.connect(dburl,{
    useMongoClient: true
    , promiseLibrary: global.Promise
  });
  mongoose.connection.on('error', function () {
    console.error('connection error', arguments)
  });
  mongoose.connection.once('open', function() {
    console.log('mongoose version: %s', mongoose.version);
  });
};

function main() {
  var app = new express();
  app.set('port', (port || 8081));
  app.set('view engine', 'jade');
  app.use(bodyParser.json({limit: '50mb'}));
  app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
  app.use(require('express-session')({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
  }));
  app.use(passport.initialize());
  app.use(passport.session()); 
  passport.use(new strategy(User.authenticate()));
  passport.serializeUser(User.serializeUser());
  passport.deserializeUser(User.deserializeUser());
  if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
      res.status(err.status || 500);
      res.render('error', {
        message: err.message,
        error: err
      });
    });
  }
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: {}
    });
  });
  app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-cache');
    next();
  });
  app.use('/', routes);
  app.use(function(req, res, next){
    if(req.isAuthenticated()) return next();
    res.redirect("/login");
  });
  app.use(express.static('public'));
  app.listen(app.get('port'), function() {
    console.log('Server started: http://localhost:' + app.get('port') + '/');
  });
};
