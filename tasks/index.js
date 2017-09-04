require('dotenv').config();
var async = require('async');
var mongoose = require('mongoose');
var std = require('../utils/stdutils');
var dbs = require('../utils/dbsutils');
var log = require('../utils/apputils').logs;

/**
 * init
 *
 */
var init = function() {
  var pspid = process.pid;
  var psver = process.version;
  log.info(`sub(${pspid})> nodejs Version: ${psver}`);

  // Add Mongoose module Event Listener.
  var dburl = process.env.mongodb;
  mongoose.Promise = global.Promise;
  mongoose.connect(dburl,{
    useMongoClient: true
    , promiseLibrary: global.Promise
  });

  mongoose.connection.on('error', function () {
    log.error(`sub(${pspid})> connection error: ${arguments}`);
  });

  mongoose.connection.once('open', function() {
    var dbver = mongoose.version;
    log.info(`sub(${pspid})> mongoose Version: v${dbver}`);
  });

  // Add Node process Event Listener.
  process.on('exit', function(code, signal) {
    log.info(`sub(${pspid})> Terminated child pid: ${pspid}`);
    log.debug(`sub(${pspid})> About to exit with c/s: ${signal || code}`);
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
        log.error(`sub(${pspid})>`, err.stack);
        throw err;
      }
      log.trace('sub(${pspid})> results: ', res);
      process.send({ request: req, pid: process.pid });
      if(callback) callback();
    });
  }, 1);

  queue.drain = function() {
    log.info(`sub(${pspid})> all items have been processed.`);
  };

  // Add Node process Event Listener.
  process.on('message', function(req) {
    log.trace(`sub >  child got message: `, req);
    queue.push(req, function() {
      log.info(`sub(${pspid})> finished processing note object.`);
    });
  });
})();
