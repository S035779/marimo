require('dotenv').config();
var mongoose = require('mongoose');
var http = require('http');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var bodyParser = require('body-parser');
var session = require('express-session')
var errorHandler = require('errorhandler');
var passport = require('passport');
var strategy = require('passport-local').Strategy;
var routes = require('./routes');
var User = require('./models').User;
var log = require('./utils/webutils').logs;

/**
 * init
 *
 */
var init = function() {
  var psver = process.version;
  log.info(`Nodejs Version: ${psver}`);

  // Add Mongoose module Event Listener.
  var dburl = process.env.mongodb
  mongoose.Promise = global.Promise;
  mongoose.connect(dburl,{
    useMongoClient: true
    , promiseLibrary: global.Promise
  });

  mongoose.connection.on('error', function () {
    log.error(`connection error: ${arguments}`)
  });

  mongoose.connection.once('open', function() {
    var dbver = mongoose.version;
    log.info(`Mongoose Version: v${dbver}`);
  });

  // Add Node process Event Listener.
  process.once('SIGUSR2', function() {
    shutdown(process.exit);
  });

  process.on('SIGINT', function() {
    shutdown(process.exit);
  });

  process.on('SIGTERM', function() {
    shutdown(process.exit); 
  });

  process.on('exit', function(code, signal) {
    log.info(`Terminated main pid: ${pspid}`);
    log.debug(`About to exit with c/s:`, signal || code);
  });
};

/**
 * shutdown
 *
 * @param callback
 */
var shutdown = function(callback) {
  mongoose.connection.close(function() {
    log.info(`Mongoose was disconnected.`);
    log.exit(function() {
      log.info(`Log4js was disconnected.`);
      if(callback) callback();
    });
  });
};

/**
 * main
 *
 */
var main = (function() {
  init();
  var app = new express();
  app.set('port', process.env.PORT || 8081);
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'jade');
  app.use(log.connect());
  app.use(favicon(__dirname + '/public/favicon.ico'));
  app.use(session({ secret: 'watch note!'
                    , resave: false
                    , saveUninitialized: false }));
  app.use(bodyParser.json({
                    limit: '50mb' }));
  app.use(bodyParser.urlencoded({
                    limit: '50mb'
                    , extended: true }));
  app.use(passport.initialize());
  app.use(passport.session()); 
  passport.use(new strategy(User.authenticate()));
  passport.serializeUser(User.serializeUser());
  passport.deserializeUser(User.deserializeUser());
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
  app.use(express.static(path.join(__dirname, 'public')));

  if('development' == app.get('env')) {
    app.use(errorHandler());
  };

  var server = http.createServer(app);
  server.listen(app.get('port'), function() {
    var port = app.get('port');
    log.info(`Express server listening on port ${port}`);
  });
})();
