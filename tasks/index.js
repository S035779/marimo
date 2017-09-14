require('dotenv').config();
var async = require('async');
var mongoose = require('mongoose');
var std = require('../utils/stdutils');
var dbs = require('../utils/dbsutils');
var log = require('../utils/logutils').logs;

var pspid = `sub(${process.pid})`;
var psenv = process.env.NODE_ENV;

/**
 * init
 *
 */
var init = function() {
  var psver = process.version;
  if(psenv === 'development')
    log.config('console', 'color', 'note-app', 'TRACE');

  if(psenv === 'staging')
    log.config('client', 'localhost', 'note-app', 'DEBUG');

  if(psenv === 'production')
    log.config('client', 'localhost', 'note-app', 'INFO');

  // Start Log4js.
  log.info(`${pspid}> Nodejs Version: ${psver}`);

  // Add Mongoose module Event Listener.
  var dburl = process.env.mongodb;
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
    console.log(
      `${pspid}> Terminated child pid: ${process.pid}`);
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
    log.close(function() {
      console.log(`${pspid}> Log4js was terminated.`);
      callback();
    });
  });
};

/**
 * main
 *
 */
var main = (function() {
  init();
  var intvl = process.env.interval;
  var monit = process.env.monitor;
  var appid = process.env.app_id;
  var pages = process.env.pages;
  var queue = async.queue(function (req, callback) {
    async.waterfall([
      async.apply(
        dbs.findHistorys, { intvl, appid, pages }, { note: req })
      , dbs.getResultSet
      , dbs.getAuctionIds
      , dbs.getAuctionItems
      , dbs.getBidHistorys
      , dbs.updateHistorys
      , dbs.updateNote
    ], function(err, req, res) {
      if (err) throw err;
      //log.trace(`${pspid}> results:`, res);
      process.send({
        appid: req.appid
        , noteid: res.note.id
        , pid: process.pid
      });
      if(callback) std.invoke(callback, 1000*60*monit);
    });
  }, 1);

  queue.drain = function() {
    log.info(`${pspid}> all items have been processed.`);
    shutdown(process.exit); 
  };

  // Add Node IPC Event Listener.
  process.on('message', function(req) {
    log.trace(`${pspid}> Child got message:`,{ noteid: req.id });
    queue.push(req, function() {
      log.info(`${pspid}> finished processing note object.`);
    });
  });

  process.on('disconnect', function() {
    log.error(`${pspid}> IPC channel disconnected.`);
  });
})();
