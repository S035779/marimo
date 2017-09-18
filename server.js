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
var log = require('./utils/logutils').logs;

var pspid = `web(${process.pid})`;
var psenv = process.env.NODE_ENV;
var server;

/**
 * init
 *
 */
var init = function() {
  var psver = process.version;
  if(psenv === 'development')
    log.config('console', 'color', 'note-web', 'TRACE');

  if(psenv === 'staging')
    log.config('file', 'basic', 'note-web', 'DEBUG');

  if(psenv === 'production')
    log.config('file', 'json', 'note-web', 'INFO');

  // Start Log4js.
  log.info(`${pspid}> Nodejs Version: ${psver}`);

  // Add Mongoose module Event Listener.
  var dburl = process.env.mongodb
  mongoose.Promise = global.Promise;
  mongoose.connect(dburl,{
    useMongoClient: true
    , promiseLibrary: global.Promise
  });

  mongoose.connection.on('error', function (err) {
    log.error(`${pspid}> Got Mongoose error: ${err.name}`);
    log.error(`${pspid}> ${err.message}`);
    log.error(`${pspid}> ${err.stack}`);
    shutdown(process.exit);
  });

  mongoose.connection.once('open', function() {
    var dbver = mongoose.version;
    log.info(`${pspid}> Mongoose Version: v${dbver}`);
  });

  // Add Node process Event Listener.
  process.once('SIGUSR2', function() {
    log.info(`${pspid}> Got SIGUSR2!`);
    shutdown(process.exit);
  });

  process.on('SIGINT', function() {
    log.info(`${pspid}> Got Ctrl-C!`);
    shutdown(process.exit);
  });

  process.on('SIGTERM', function() {
    log.info(`${pspid}> Got SIGTERM!`);
    shutdown(process.exit);
  });

  process.on('uncaughtException', function(err) {
    log.error(`${pspid}> Got uncaught exception: ${err.name}`);
    log.error(`${pspid}> ${err.message}`);
    log.error(`${pspid}> ${err.stack}`);
    shutdown(process.exit);
  });

  process.on('warning', function(err) {
    log.warn(`${pspid}> Got warning: ${err.name}`);
    log.warn(`${pspid}> ${err.message}`);
    log.warn(`${pspid}> ${err.stack}`);
  });

  process.on('exit', function(code, signal) {
    console.log(`${pspid}> Terminated main pid: ${process.pid}`);
    console.log(
      `${pspid}> about to exit with c/s: ${signal || code}`);
  });
};

/**
 * shutdown
 *
 * @param callback
 */
var shutdown = function(callback) {
  mongoose.connection.close(function() {
    log.info(`${pspid}> Mongoose was disconnected.`);
    server.close(function() {
      log.info(`${pspid}> Http was terminated.`);
      log.close(function() {
        console.log(`${pspid}> Log4js was terminated.`);
        callback();
      });
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
  app.set('case sensitive routeing', true);
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

  if('staging' == app.get('env')) {
    app.use(errorHandler());
  };

  if('production' == app.get('env')) {
    app.use(errorHandler());
    app.set('port', 8081);
  };

  server = http.createServer(app);
  server.listen(app.get('port'), function() {
    var port = app.get('port');
    log.info(`${pspid}> Express server listening on port ${port}`);
  });
})();
