require('dotenv').config();
var async = require('async');
var mongoose = require('mongoose');
var mps = require('child_process');
var std = require('./utils/stdutils');
var dbs = require('./utils/dbsutils');
var log = require('./utils/apputils').logs;

/**
 * init
 *
 */
var init = function() {
  // Log4js Server Start.
  log.server('main> Log4js Server stated.');

  var psver = process.version;
  log.info(`main> nodejs Version: ${psver}`);

  // Add Mongoose module Event Listener.
  var dburl = process.env.mongodb;
  mongoose.Promise = global.Promise;
  mongoose.connect(dburl,{
    useMongoClient: true
    , promiseLibrary: global.Promise
  });

  mongoose.connection.on('error', function () {
    log.error(`main> connection error: ${arguments}`);
  });

  mongoose.connection.once('open', function() {
    var dbver = mongoose.version;
    log.info(`main> mongoose Version: v${dbver}`);
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
    log.debug(`main> About to exit with c/s: ${signal || code}`);
  });
};

/**
 * fork
 *
 * @returns {object}
 */
var fork = function() {
  var mod = __dirname + '/tasks/index.js';
  var cps = mps.fork(mod);

  cps.on('message', function(req) {
    log.info(`main> parent got message: ${req}`);
  });

  cps.on('exit', function(code, signal) {
    log.info('main> child process terminated.' 
      + `code/signal: ${signal || code}`);
  });

  cps.on('disconnect', function() {
    log.info('main> child process disconnected.');
  });

  log.info(`main> Forked child pid: ${cps.pid}`);
  return cps;
};

/**
 * shutdown
 *
 * @param callback
 */
var shutdown = function(callback) {
  mongoose.connection.close(function() {
    log.info('main> Mongoose was disconnected.');
    log.exit(function() {
      log.info('main> Log4js was disconnected.');
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
  var cpu = require('os').cpus().length;
  var cps = [];
  var idx=0;
  var queue = async.queue(function (req, callback) {
    if(cps.length >= cpu) idx=0;
    if(cps[idx] === undefined
      || !cps[idx].connected) cps[idx] = fork();
    cps[idx].send(req);
    idx++;
    if(callback) callback();
  }, cpu);

  queue.drain = function() {
    log.info('main> all items have been processed.');
  };

  var intvl = process.env.interval;
  var monit = process.env.monitor;
  std.invoke(function() {
    async.waterfall([
      async.apply(
        dbs.findUsers, { intvl, monit }, {})
      , dbs.findNotes
    ], function(err, req, res) {
      if(err) {
        log.error('main> ', err.stack);
        throw err;
      }
      log.trace('main> results: ', res);
      res.notes.forEach( function(note) {
        queue.push(note, function() {
          log.info('main> finished processing.');
        });
      });
      log.info(`main> ${monit} min. interval...`);
    });
  }, 0, 1000*60*monit);
})();

