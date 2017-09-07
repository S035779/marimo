require('dotenv').config();
var async = require('async');
var mongoose = require('mongoose');
var std = require('../utils/stdutils');
var dbs = require('../utils/dbsutils');
var log = require('../utils/logutils').logs;
var pspid = `sub(${process.pid})`;

/**
 * init
 *
 */
var init = function() {
  var psver = process.version;
  // Start Log4js.
  log.config('console', 'color', 'note-app', 'DEBUG');
  log.info(`${pspid}> Nodejs Version: ${psver}`);

  // Add Mongoose module Event Listener.
  var dburl = process.env.mongodb;
  mongoose.Promise = global.Promise;
  mongoose.connect(dburl,{
    useMongoClient: true
    , promiseLibrary: global.Promise
  });

  mongoose.connection.on('error', function () {
    log.error(`${pspid}> connection error: ${arguments}`);
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
    log.error(`${pspid}> Got uncaught exception: ${err.message}`);
    process.exit(1); 
  });

  process.on('exit', function(code, signal) {
    console.log(`${pspid}> Terminated child pid: ${pspid}`);
    console.log(`${pspid}> About to exit with c/s:`
      , signal || code);
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
  var appid = process.env.app_id;
  var pages = process.env.pages;
  var intvl = process.env.interval;
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
      if (err) {
        log.error(`${pspid}>`, err.stack);
        throw err;
      }
      //log.trace(`${pspid}> results:`, res);
      process.send({ request: req, pid: process.pid });
      if(callback) callback();
    });
  }, 1);

  queue.drain = function() {
    log.info(`${pspid}> all items have been processed.`);
    shutdown(process.exit); 
  };

  // Add Node process Event Listener.
  process.on('message', function(req) {
    log.trace(`${pspid}>  child got message:`, req);
    queue.push(req, function() {
      log.info(`${pspid}> finished processing note object.`);
    });
  });
})();
